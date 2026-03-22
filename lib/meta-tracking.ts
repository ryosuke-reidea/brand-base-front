// クライアントサイドのMeta追跡ヘルパー

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
  }
}

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : undefined;
}

function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

interface TrackEventOptions {
  eventName: string;
  email?: string;
}

/**
 * フロント側のfbqとサーバー側のCAPIの両方にイベントを送信
 * event_idを共有して重複排除を有効にする
 */
export async function trackMetaEvent({ eventName, email }: TrackEventOptions) {
  const eventId = generateEventId();
  const fbc = getCookie('_fbc');
  const fbp = getCookie('_fbp');
  const sourceUrl = typeof window !== 'undefined' ? window.location.href : undefined;

  // フロント側: fbq発火
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, {}, { eventID: eventId });
  }

  // サーバー側: CAPI送信
  try {
    await fetch('/api/meta-capi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName,
        eventId,
        email,
        fbc,
        fbp,
        sourceUrl,
      }),
    });
  } catch (error) {
    // CAPIの送信失敗はユーザーに影響させない
    console.error('Meta CAPI send error:', error);
  }
}
