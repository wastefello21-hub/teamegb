import twilio from 'twilio';

// Use mock credentials if real ones aren't provided in .env
const accountSid = process.env.TWILIO_ACCOUNT_SID || 'mock-account-sid';
const authToken = process.env.TWILIO_AUTH_TOKEN || 'mock-auth-token';
const fromNumber = process.env.TWILIO_WHATSAPP_FROM_NUMBER || 'whatsapp:+14155238886'; // Twilio sandbox number

const hasRealTwilioCreds = accountSid.startsWith('AC') && authToken !== 'mock-auth-token';
const client = hasRealTwilioCreds ? twilio(accountSid, authToken) : null;

export const sendWhatsAppThankYou = async (phone: string, name: string, amount: number, receiptNumber: string) => {
  const isMock = !hasRealTwilioCreds || !client;
  const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`; // Assuming Indian numbers

  const message = `Namaste ${name}, thank you for contributing ₹${amount} towards TEAM EGB Ganesha Festival. Your 6-digit e-receipt ID is ${receiptNumber}. Your support means a lot to us. Devotion • Faith • Trust.`;

  if (isMock) {
    console.log('[MOCK TWILIO] Sending WhatsApp message to', formattedPhone);
    console.log('[MOCK TWILIO] Message:', message);
    return { success: true, mock: true, messageId: 'mock-id' };
  }

  try {
    const response = await client.messages.create({
      body: message,
      from: fromNumber,
      to: `whatsapp:${formattedPhone}`
    });
    console.log('WhatsApp message sent successfully:', response.sid);
    return { success: true, messageId: response.sid };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return { success: false, error };
  }
};
