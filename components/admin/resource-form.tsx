'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { classNames } from '@/components/ui/utils';

export type FieldType = 'text' | 'textarea' | 'number' | 'checkbox' | 'select' | 'date';

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  help?: string;
}

interface ResourceFormProps {
  fields: FieldDef[];
  form: Record<string, unknown>;
  onChange: (name: string, value: unknown) => void;
}

export function ResourceForm({ fields, form, onChange }: ResourceFormProps) {
  return (
    <div className="mt-6 grid gap-5 sm:grid-cols-2">
      {fields.map((field) => (
        <div
          key={field.name}
          className={classNames('space-y-2', field.type === 'textarea' && 'sm:col-span-2')}
        >
          <Label htmlFor={`field-${field.name}`}>
            {field.label}
            {field.required && <span className="ml-0.5 text-destructive">*</span>}
          </Label>

          {field.type === 'textarea' && (
            <Textarea
              id={`field-${field.name}`}
              rows={5}
              placeholder={field.placeholder}
              value={String(form[field.name] ?? '')}
              onChange={(event) => onChange(field.name, event.target.value)}
            />
          )}

          {field.type === 'select' && (
            <select
              id={`field-${field.name}`}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={String(form[field.name] ?? '')}
              onChange={(event) => onChange(field.name, event.target.value)}
            >
              {(field.options ?? []).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}

          {field.type === 'checkbox' && (
            <label className="flex items-center gap-2.5 text-sm">
              <input
                id={`field-${field.name}`}
                type="checkbox"
                className="h-4 w-4 rounded border-input accent-primary"
                checked={Boolean(form[field.name])}
                onChange={(event) => onChange(field.name, event.target.checked)}
              />
              Enabled
            </label>
          )}

          {(field.type === 'text' || field.type === 'number' || field.type === 'date') && (
            <Input
              id={`field-${field.name}`}
              type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
              placeholder={field.placeholder}
              value={String(form[field.name] ?? '')}
              onChange={(event) =>
                onChange(
                  field.name,
                  field.type === 'number'
                    ? event.target.value === ''
                      ? ''
                      : Number(event.target.value)
                    : event.target.value
                )
              }
            />
          )}

          {field.help && <p className="text-xs text-muted-foreground">{field.help}</p>}
        </div>
      ))}
    </div>
  );
}
