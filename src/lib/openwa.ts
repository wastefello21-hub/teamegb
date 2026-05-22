type OpenWaResult = {
  success: boolean;
  provider: 'openwa';
  status?: number;
  data?: unknown;
  error?: unknown;
};

const normalizePhoneToChatId = (phone: string) => {
  let digits = phone.replace(/[^\d]/g, '');

  // Most contributor numbers are entered as 10-digit Indian mobile numbers.
  // Convert them to E.164-style country-code format before sending to WhatsApp.
  if (digits.length === 10) {
    digits = `91${digits}`;
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = `91${digits.slice(1)}`;
  }

  return `${digits}@c.us`;
};

const resolveSendTextEndpoint = (baseUrl: string, sendTextPath: string) => {
  const trimmedBase = baseUrl.replace(/\/$/, '');
  const normalizedPath = sendTextPath.startsWith('/') ? sendTextPath : `/${sendTextPath}`;

  if (/\/sendText$/i.test(trimmedBase)) {
    return trimmedBase;
  }

  return `${trimmedBase}${normalizedPath}`;
};

export const sendWhatsAppThankYouOpenWA = async (
  phone: string,
  name: string,
  amount: number,
  receiptNumber: string
): Promise<OpenWaResult> => {
  const baseUrl = process.env.OPENWA_API_URL || process.env.WHATSAPP_SERVICE_URL;
  const apiKey = process.env.OPENWA_API_KEY || process.env.WHATSAPP_SERVICE_TOKEN;
  const sendTextPath = process.env.OPENWA_SENDTEXT_PATH || '/sendText';

  if (!baseUrl) {
    return { success: false, provider: 'openwa', error: 'OPENWA_API_URL is not configured' };
  }

  const text = `Namaste ${name}, thank you for contributing ₹${amount} towards TEAM EGB Ganesha Festival. Your 6-digit e-receipt ID is ${receiptNumber}. Your support means a lot to us.`;
  const chatId = normalizePhoneToChatId(phone);
  const endpoint = resolveSendTextEndpoint(baseUrl, sendTextPath);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { key: apiKey } : {}),
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({ phone, text }),
    });

    const bodyText = await response.text();
    let parsed: unknown = bodyText;
    try {
      parsed = JSON.parse(bodyText);
    } catch {
      // keep raw text if not JSON
    }

    if (!response.ok) {
      return {
        success: false,
        provider: 'openwa',
        status: response.status,
        error: parsed,
      };
    }

    return {
      success: true,
      provider: 'openwa',
      status: response.status,
      data: parsed,
    };
  } catch (error) {
    return { success: false, provider: 'openwa', error };
  }
};
