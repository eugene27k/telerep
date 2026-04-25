import type { ReactNode } from 'react';

// Minimal root layout — all html/body/lang is owned by app/[locale]/layout.tsx
// This file exists because Next.js requires a layout at the root segment.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
