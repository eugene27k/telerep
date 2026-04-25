import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function ChatNotFound() {
  const t = useTranslations('Chat');
  const tCommon = useTranslations('Common');
  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
      <h1 className="text-2xl font-semibold">{t('notFoundTitle')}</h1>
      <p className="text-muted-foreground max-w-sm">{t('notFoundBody')}</p>
      <Link href="/" className="mt-4 text-sm underline underline-offset-4">
        {tCommon('backHome')}
      </Link>
    </main>
  );
}
