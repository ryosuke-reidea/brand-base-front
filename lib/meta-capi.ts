import crypto from 'crypto';

const PIXEL_ID = process.env.META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
const API_VERSION = 'v21.0';

function hashSHA256(value: string): string {
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

interface CAPIEventParams {
  eventName: string;
  eventId: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  fbc?: string;
  fbp?: string;
  sourceUrl?: string;
}

export async function sendCAPIEvent({
  eventName,
  eventId,
  email,
  ip,
  userAgent,
  fbc,
  fbp,
  sourceUrl,
}: CAPIEventParams): Promise<{ success: boolean; error?: string }> {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.error('Meta CAPI: Missing PIXEL_ID or ACCESS_TOKEN');
    return { success: false, error: 'Missing configuration' };
  }

  const userData: Record<string, any> = {};
  if (email) userData.em = [hashSHA256(email)];
  if (ip) userData.client_ip_address = ip;
  if (userAgent) userData.client_user_agent = userAgent;
  if (fbc) userData.fbc = fbc;
  if (fbp) userData.fbp = fbp;

  const eventData = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: 'website',
        event_source_url: sourceUrl || 'https://brand-base.jp/apply',
        user_data: userData,
      },
    ],
  };

  try {
    const url = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Meta CAPI error:', result);
      return { success: false, error: JSON.stringify(result) };
    }

    console.log('Meta CAPI event sent:', eventName, result);
    return { success: true };
  } catch (error) {
    console.error('Meta CAPI exception:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
