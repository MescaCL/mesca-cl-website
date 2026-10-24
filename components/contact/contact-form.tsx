'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { contactSchema } from '@/lib/validations';
import type { z } from 'zod';

type ContactFormValues = z.infer<typeof contactSchema>;

const CATEGORIES = [
  { value: 'collaboration', label: 'Collaboration' },
  { value: 'mentorship', label: 'Mentorship' },
  { value: 'hiring', label: 'Hiring / Freelance' },
  { value: 'speaking', label: 'Speaking / Event' },
  { value: 'general', label: 'General enquiry' },
];

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [serverMessage, setServerMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: async (values) => {
      const result = contactSchema.safeParse(values);
      if (result.success) {
        return { values: result.data, errors: {} };
      }
      const fieldErrors: Record<string, { type: string; message: string }> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (typeof field === 'string' && !fieldErrors[field]) {
          fieldErrors[field] = { type: 'validation', message: issue.message };
        }
      });
      return { values: {}, errors: fieldErrors };
    },
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      category: 'general',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setSubmitting(true);
    setStatus('idle');
    setServerMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        setStatus('error');
        setServerMessage(payload.message ?? 'Something went wrong. Please try again.');
        return;
      }

      setStatus('success');
      setServerMessage(payload.message ?? 'Thanks — your message has been received.');
      reset();
    } catch {
      setStatus('error');
      setServerMessage('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };


  if (status === 'success') {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/8 p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
        <h3 className="mt-4 font-display text-xl font-semibold">Message received</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{serverMessage}</p>
        <Button variant="outline" className="mt-6" onClick={() => setStatus('idle')}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Your name</Label>
          <Input
            id="name"
            placeholder="Ada Lovelace"
            aria-invalid={Boolean(errors.name)}
            {...register('name')}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="ada@example.com"
            aria-invalid={Boolean(errors.email)}
            {...register('email')}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            placeholder="Collaboration opportunity"
            aria-invalid={Boolean(errors.subject)}
            {...register('subject')}
          />
          {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">What&apos;s this about?</Label>
          <select
            id="category"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            {...register('category')}
          >
            {CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          rows={6}
          placeholder="Tell me a little about what you have in mind…"
          aria-invalid={Boolean(errors.message)}
          {...register('message')}
        />
        {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
      </div>

      {status === 'error' && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
          {serverMessage}
        </p>
      )}

      <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Sending…
          </>
        ) : (
          <>
            <Send size={16} />
            Send message
          </>
        )}
      </Button>
    </form>
  );
}