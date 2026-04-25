'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';

type Props = {
  chatSlug: string;
  userId: string;
  label: string;
  pendingLabel: string;
};

export function IssueCertButton({
  chatSlug,
  userId,
  label,
  pendingLabel,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const res = await fetch('/api/certificates/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatSlug, userId }),
      });
      if (!res.ok) {
        setError(await res.text());
        return;
      }
      const data = (await res.json()) as { verifyUrl: string };
      window.open(data.verifyUrl, '_blank', 'noopener');
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        size="sm"
        variant="outline"
        onClick={handleClick}
        disabled={pending}
      >
        {pending ? pendingLabel : label}
      </Button>
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </div>
  );
}
