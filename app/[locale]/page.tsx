import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Badge } from '@/components/ui/badge';

export default function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  const t = useTranslations('Home');

  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-6 p-8 text-center">
      <Badge variant="outline">{t('badge')}</Badge>
      <h1 className="text-5xl font-bold tracking-tight">{t('title')}</h1>
      <p className="text-lg text-muted-foreground max-w-md">{t('subtitle')}</p>
      <div className="flex gap-3 mt-2">
        <Link
          href="/"
          locale="uk"
          className="text-sm underline underline-offset-4"
        >
          Українська
        </Link>
        <Link
          href="/"
          locale="en"
          className="text-sm underline underline-offset-4"
        >
          English
        </Link>
      </div>
    </main>
  );
}
