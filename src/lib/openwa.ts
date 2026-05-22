type OpenWaResult = {
  success: boolean;
  provider: 'openwa';
  status?: number;
  data?: unknown;
  error?: unknown;
};

const normalizePhoneToChatId = (phone: string) => {
  const digits = phone.replace(/[^\d]/g, '');
  return `${digits}@c.us`;
};

export const sendWhatsAppThankYouOpenWA = async (
  phone: string,
  name: string,
  amount: number,
  receiptNumber: string
): Promise<OpenWaResult> => {
  const baseUrl = process.env.OPENWA_API_URL;
  const apiKey = process.env.OPENWA_API_KEY;
  const sendTextPath = process.env.OPENWA_SENDTEXT_PATH || '/sendText';

  if (!baseUrl) {
    return { success: false, provider: 'openwa', error: 'OPENWA_API_URL is not configured' };
  }

  const text = `Namaste ${name}, thank you for contributing ₹${amount} towards TEAM EGB Ganesha Festival. Your 6-digit e-receipt ID is ${receiptNumber}. Your support means a lot to us.`;
  const chatId = normalizePhoneToChatId(phone);
  const endpoint = `${baseUrl.replace(/\/$/, '')}${sendTextPath.startsWith('/') ? sendTextPath : `/${sendTextPath}`}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { key: apiKey } : {}),
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({ chatId, text }),
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
