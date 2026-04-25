import { getTranslations } from 'next-intl/server';

export async function SiteFooter() {
  const t = await getTranslations('Footer');
  const year = new Date().getFullYear();

  return (
    <footer className="border-t mt-16">
      <div className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between text-xs text-muted-foreground">
        <span>© {year} TeleRep</span>
        <a
          href="https://github.com/eugene27k/telerep"
          target="_blank"
          rel="noreferrer"
          className="hover:text-foreground"
        >
          {t('sourceLink')}
        </a>
      </div>
    </footer>
  );
}
