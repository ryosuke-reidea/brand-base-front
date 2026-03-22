import { NextRequest, NextResponse } from 'next/server';
import { sendCAPIEvent } from '@/lib/meta-capi';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventName, eventId, email, fbc, fbp, sourceUrl } = body;

    if (!eventName || !eventId) {
      return NextResponse.json(
        { success: false, error: 'eventName and eventId are required' },
        { status: 400 }
      );
    }

    // リクエストからIPとUser-Agentを取得
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      undefined;
    const userAgent = request.headers.get('user-agent') || undefined;

    const result = await sendCAPIEvent({
      eventName,
      eventId,
      email,
      ip,
      userAgent,
      fbc,
      fbp,
      sourceUrl,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('meta-capi route error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
