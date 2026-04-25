'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Props = { next: string; defaultUsername?: string; cta: string; placeholder: string };

export function DevLoginForm({ next, defaultUsername, cta, placeholder }: Props) {
  const [username, setUsername] = useState(defaultUsername ?? '');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch('/api/auth/dev-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      if (!res.ok) {
        setError(await res.text());
        return;
      }
      window.location.href = next;
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-xs">
      <Input
        name="username"
        placeholder={placeholder}
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoComplete="username"
        required
      />
      <Button type="submit" disabled={pending || !username}>
        {pending ? '…' : cta}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </form>
  );
}
