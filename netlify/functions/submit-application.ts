import { createClient } from '@supabase/supabase-js';

const GOOGLE_CHAT_WEBHOOK = process.env.GOOGLE_CHAT_WEBHOOK_URL!;

interface ApplicationData {
  type: 'idea' | 'consult';
  name: string;
  email: string;
  phone?: string;
  productName?: string;
  productDescription?: string;
  additionalInfo?: string;
  inquiry?: string;
}

export const handler = async (event: any) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    console.log('submit-application called');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );

    const data: ApplicationData = JSON.parse(event.body || '{}');
    console.log('Received data:', data);

    const { data: application, error: dbError } = await supabase
      .from('applications')
      .insert({
        type: data.type,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        product_name: data.productName || null,
        product_description: data.productDescription || null,
        additional_info: data.additionalInfo || null,
        inquiry: data.inquiry || null,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    let chatMessage = '';
    if (data.type === 'idea') {
      chatMessage = `🎯 *新しいアイデア応募*\n\n` +
        `*お名前:* ${data.name}\n` +
        `*メール:* ${data.email}\n` +
        `*電話:* ${data.phone || 'なし'}\n` +
        `*商品名:* ${data.productName}\n` +
        `*内容:*\n${data.productDescription}\n` +
        `${data.additionalInfo ? `*補足:*\n${data.additionalInfo}\n` : ''}`;
    } else {
      chatMessage = `💬 *新しい相談*\n\n` +
        `*お名前:* ${data.name}\n` +
        `*メール:* ${data.email}\n` +
        `*電話:* ${data.phone || 'なし'}\n` +
        `*相談内容:*\n${data.inquiry}\n`;
    }

    try {
      const chatResponse = await fetch(GOOGLE_CHAT_WEBHOOK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: chatMessage,
        }),
      });

      if (!chatResponse.ok) {
        console.error('Google Chat notification failed:', await chatResponse.text());
      }
    } catch (chatError) {
      console.error('Google Chat notification error:', chatError);
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        message: '応募を受け付けました',
        applicationId: application.id,
      }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : '不明なエラーが発生しました',
      }),
    };
  }
};
