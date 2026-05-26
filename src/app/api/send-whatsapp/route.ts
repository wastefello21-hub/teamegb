import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

type SendWhatsAppBody = {
  phone?: string;
  message?: string;
  imagePath?: string;
  receiptNumber?: string;
  contributorName?: string;
};

const sanitizePhone = (phone: string) => phone.replace(/\D/g, '');

const getBaseSiteUrl = (request: NextRequest) => {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configuredSiteUrl) {
    return configuredSiteUrl;
  }

  return request.nextUrl.origin;
};

const buildAbsoluteUrl = (request: NextRequest, inputPathOrUrl: string) => {
  try {
    return new URL(inputPathOrUrl, getBaseSiteUrl(request)).toString();
  } catch {
    return new URL('/ganesha_hero_bg.png', getBaseSiteUrl(request)).toString();
  }
};

const buildImageCaption = (message: string) => {
  const firstLine = message.split('\n').find((line) => line.trim().length > 0)?.trim() || 'Team EGB update';
  return firstLine.slice(0, 900);
};

async function sendCloudMessage(payload: Record<string, unknown>) {
  const accessToken = process.env.WHATSAPP_CLOUD_ACCESS_TOKEN?.trim();
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const apiVersion = process.env.WHATSAPP_CLOUD_API_VERSION?.trim() || 'v21.0';

  if (!accessToken || !phoneNumberId) {
    return {
      ok: false,
      error: 'WhatsApp Cloud API is not configured. Set WHATSAPP_CLOUD_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID.',
    };
  }

  const response = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({} as Record<string, unknown>));

  if (!response.ok) {
    const errorMessage = typeof data.error === 'object' && data.error && 'message' in data.error
      ? String((data.error as { message?: unknown }).message || 'Unknown WhatsApp send failure')
      : 'Unknown WhatsApp send failure';

    return {
      ok: false,
      error: errorMessage,
      details: data,
    };
  }

  return {
    ok: true,
    data,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SendWhatsAppBody;
    const phone = sanitizePhone(body.phone || '');
    const message = body.message?.trim() || '';

    if (!phone || phone.length < 10 || !message) {
      return NextResponse.json(
        { error: 'A valid phone number and message are required.' },
        { status: 400 }
      );
    }

    const imageUrl = buildAbsoluteUrl(request, body.imagePath?.trim() || '/ganesha_hero_bg.png');
    const caption = buildImageCaption(message);

    const imageResult = await sendCloudMessage({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: phone,
      type: 'image',
      image: {
        link: imageUrl,
        caption,
      },
    });

    if (!imageResult.ok) {
      return NextResponse.json(
        { error: imageResult.error, details: imageResult.details || null },
        { status: 503 }
      );
    }

    const textResult = await sendCloudMessage({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: phone,
      type: 'text',
      text: {
        preview_url: true,
        body: message,
      },
    });

    if (!textResult.ok) {
      return NextResponse.json(
        {
          error: textResult.error,
          details: textResult.details || null,
          imageSent: true,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        imageUrl,
        imageResponse: imageResult.data,
        textResponse: textResult.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send WhatsApp error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send WhatsApp message',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}