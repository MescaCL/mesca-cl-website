import { stringify } from 'querystring';

export async function adminFetch(
  url: string,
  init?: RequestInit
): Promise<Response> {
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      'Content-Type': 'application/json',
    },
  });

  if (res.status === 401) {
    window.location.href = '/admin/login';
  }

  return res;
}
