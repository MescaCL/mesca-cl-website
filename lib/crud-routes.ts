import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAdmin, getClientIp, requireCsrf } from '@/lib/api-guard';
import { auditLog, getUserById } from '@/lib/auth';
import { getSession } from '@/lib/session';

export interface CrudHandlers<T> {
  list: () => Promise<T[]>;
  create: (data: Record<string, unknown>) => Promise<T>;
  update: (id: string, data: Record<string, unknown>) => Promise<T | null>;
  remove: (id: string) => Promise<boolean>;
  schema: z.ZodType<Record<string, unknown>>;
  resourceType: string;
  /**
   * Optional transform applied to the validated payload before it is stored.
   * It must only transform the keys that are present in `data`.
   */
  transform?: (data: Record<string, unknown>) => Record<string, unknown>;
}

async function readJson(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function createCrudRoutes<T extends { id: string }>(handlers: CrudHandlers<T>) {
  const { list, create, update, remove, schema, resourceType, transform } = handlers;

  // `schema` is typed as a generic ZodType, but `.partial()`/`.safeParse()` are
  // only available on a zod object. Cast to a ZodObject so the update path can
  // work with partial validation.
  const objectSchema = schema as z.ZodObject<Record<string, z.ZodTypeAny>>;

  async function currentUserId(): Promise<string | null> {
    const session = getSession();
    if (!session) return null;
    const u = await getUserById(session.userId); return u?.id ?? session.userId;
  }

  return {
    async GET() {
      const unauthorized = await requireAdmin();
      if (unauthorized) return unauthorized;

      try {
        return NextResponse.json({ data: await list() });
      } catch (error) {
        console.error(`[admin:${resourceType}] list failed`, error);
        return NextResponse.json(
          { message: `Could not load ${resourceType}.` },
          { status: 500 }
        );
      }
    },

    async POST(request: NextRequest) {
      const csrfError = requireCsrf(request);
      if (csrfError) return csrfError;
      const unauthorized = await requireAdmin();
      if (unauthorized) return unauthorized;

      const body = await readJson(request);
      if (body === null) {
        return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
      }

      const parsed = schema.safeParse(body);
      if (!parsed.success) {
        const fieldErrors: Record<string, string> = {};
        parsed.error.issues.forEach((issue) => {
          const field = issue.path[0];
          if (typeof field === 'string' && !fieldErrors[field]) {
            fieldErrors[field] = issue.message;
          }
        });
        return NextResponse.json(
          { message: 'Please correct the highlighted fields.', errors: fieldErrors },
          { status: 422 }
        );
      }

      try {
        const payload = transform ? transform(parsed.data) : parsed.data;
        // DEBUG: log payload keys and types
        console.log('[DEBUG] create payload:', JSON.stringify(payload));
        const created = await create(payload);
        await await auditLog(
          await currentUserId(),
          'create',
          resourceType,
          created.id,
          null,
          getClientIp(request)
        );
        return NextResponse.json({ data: created, message: `${resourceType} created.` }, { status: 201 });
      } catch (error) {
        console.error(`[admin:${resourceType}] create failed`, error);
        return NextResponse.json(
          { message: `Could not create ${resourceType}.` },
          { status: 500 }
        );
      }
    },

    async PUT(request: NextRequest) {
      const csrfError = requireCsrf(request);
      if (csrfError) return csrfError;
      const unauthorized = await requireAdmin();
      if (unauthorized) return unauthorized;

      const body = await readJson(request);
      if (body === null || typeof body !== 'object') {
        return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
      }

      const { id, ...rest } = body as { id?: string } & Record<string, unknown>;
      if (!id) {
        return NextResponse.json({ message: 'An id is required.' }, { status: 400 });
      }

      // Updates are partial — only the supplied fields are validated and saved.
      const parsed = objectSchema.partial().safeParse(rest);
      if (!parsed.success) {
        const fieldErrors: Record<string, string> = {};
        parsed.error.issues.forEach((issue) => {
          const field = issue.path[0];
          if (typeof field === 'string' && !fieldErrors[field]) {
            fieldErrors[field] = issue.message;
          }
        });
        return NextResponse.json(
          { message: 'Please correct the highlighted fields.', errors: fieldErrors },
          { status: 422 }
        );
      }

      try {
        const payload = transform ? transform(parsed.data) : parsed.data;
        const updated = await update(id, payload);
        if (!updated) {
          return NextResponse.json({ message: `${resourceType} not found.` }, { status: 404 });
        }
        await await auditLog(
          await currentUserId(),
          'update',
          resourceType,
          id,
          null,
          getClientIp(request)
        );
        return NextResponse.json({ data: updated, message: `${resourceType} updated.` });
      } catch (error) {
        console.error(`[admin:${resourceType}] update failed`, error);
        return NextResponse.json(
          { message: `Could not update ${resourceType}.` },
          { status: 500 }
        );
      }
    },

    async DELETE(request: NextRequest) {
      const csrfError = requireCsrf(request);
      if (csrfError) return csrfError;
      const unauthorized = await requireAdmin();
      if (unauthorized) return unauthorized;

      const id = request.nextUrl.searchParams.get('id');
      if (!id) {
        return NextResponse.json({ message: 'An id is required.' }, { status: 400 });
      }

      try {
        const deleted = await remove(id);
        if (!deleted) {
          return NextResponse.json({ message: `${resourceType} not found.` }, { status: 404 });
        }
        await await auditLog(
          await currentUserId(),
          'delete',
          resourceType,
          id,
          null,
          getClientIp(request)
        );
        return NextResponse.json({ message: `${resourceType} deleted.` });
      } catch (error) {
        console.error(`[admin:${resourceType}] delete failed`, error);
        return NextResponse.json(
          { message: `Could not delete ${resourceType}.` },
          { status: 500 }
        );
      }
    },
  };
}
