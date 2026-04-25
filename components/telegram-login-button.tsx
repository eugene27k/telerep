'use client';

import { useEffect, useRef } from 'react';

type Props = {
  botUsername: string;
  authUrl: string;
};

// Embeds Telegram's official Login Widget.
// Uses dangerouslySetInnerHTML on script because Next won't run scripts in dangerouslySetInnerHTML
// — instead we manually create the script element and append.
export function TelegramLoginButton({ botUsername, authUrl }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', botUsername);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-auth-url', authUrl);
    script.setAttribute('data-request-access', 'write');
    node.appendChild(script);
    return () => {
      node.innerHTML = '';
    };
  }, [botUsername, authUrl]);

  return <div ref={ref} />;
}
