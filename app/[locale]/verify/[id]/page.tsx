import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/i18n/navigation';
import { getCertificate } from '@/lib/db/queries';

export const revalidate = 3600;

type Params = Promise<{ locale: string; id: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { locale, id } = await params;
  const data = await getCertificate(id);
  const t = await getTranslations({ locale, namespace: 'Verify' });
  if (!data) return { title: t('notFoundTitle') };
  return {
    title: t('metaTitle', {
      name: data.user.display_name,
      community: data.chat.title,
    }),
  };
}

export default async function VerifyPage({ params }: { params: Params }) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const data = await getCertificate(id);
  if (!data) notFound();

  const t = await getTranslations('Verify');
  const tCommon = await getTranslations('Common');
  const date = new Date(data.cert.issued_at).toLocaleDateString(
    locale === 'uk' ? 'uk-UA' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' },
  );

  return (
    <main className="flex-1 w-full max-w-xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/" className="text-sm text-muted-foreground hover:underline">
          {tCommon('backHome')}
        </Link>
      </div>

      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <Badge className="bg-green-600 hover:bg-green-600">{t('verified')}</Badge>
            <span className="text-xs text-muted-foreground tabular-nums">
              {data.cert.id.slice(0, 8)}…
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">{t('subtitle')}</p>

          <dl className="mt-8 space-y-4">
            <Field label={t('recipient')}>
              {data.user.username ? (
                <Link
                  href={`/u/${data.user.username}`}
                  className="font-medium hover:underline underline-offset-4"
                >
                  {data.user.display_name}
                </Link>
              ) : (
                <span className="font-medium">{data.user.display_name}</span>
              )}
            </Field>

            <Field label={t('community')}>
              <Link
                href={`/c/${data.chat.slug}`}
                className="font-medium hover:underline underline-offset-4"
              >
                {data.chat.title}
              </Link>
            </Field>

            <Field label={t('rank')}>
              <span className="font-mono tabular-nums font-bold text-2xl">
                #{data.cert.rank}
              </span>
            </Field>

            <Field label={t('issued')}>
              <span className="tabular-nums">{date}</span>
            </Field>

            {data.issuedBy ? (
              <Field label={t('issuedBy')}>
                <span className="text-sm text-muted-foreground">
                  {data.issuedBy.display_name}
                  {data.issuedBy.username ? ` (@${data.issuedBy.username})` : ''}
                </span>
              </Field>
            ) : null}
          </dl>

          <div className="mt-8 pt-6 border-t flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-mono break-all">
              {data.cert.id}
            </span>
            <a
              href={`/api/certificates/${data.cert.id}/pdf`}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium hover:underline underline-offset-4 whitespace-nowrap ml-4"
            >
              {t('downloadPdf')} ↓
            </a>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}
