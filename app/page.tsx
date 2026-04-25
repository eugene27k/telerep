import { redirect } from 'next/navigation';

// Middleware redirects / → /uk (defaultLocale).
// This page is a fallback in case middleware is bypassed.
export default function RootPage() {
  redirect('/uk');
}
