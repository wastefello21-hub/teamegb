import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { format } from 'date-fns';

const BASE_RECEIPT_WIDTH = 1200;
const BASE_RECEIPT_HEIGHT = 840;

const FIELD_POSITIONS = {
  receiptNumber: { x: 1112, y: 128, size: 22 },
  dateDay: { x: 1050, y: 204, size: 20 },
  dateMonth: { x: 1100, y: 204, size: 20 },
  dateYear: { x: 1150, y: 204, size: 20 },
  name: { x: 377, y: 378, size: 26 },
  phone: { x: 428, y: 441, size: 26 },
  amount: { x: 535, y: 502, size: 26 },
  cashCheck: { x: 449, y: 561, size: 34 },
  upiCheck: { x: 701, y: 561, size: 34 },
  collector: { x: 272, y: 718, size: 26 },
} as const;

let embeddedFontCss: string | null = null;

const hasDevanagariText = (text: string) => /[\u0900-\u097F]/.test(text);

const getTextFontFamily = (text: string) => {
  const handwritingStack = "'Segoe Print', 'Bradley Hand', 'Lucida Handwriting', 'Comic Sans MS', 'Segoe Script', 'Snell Roundhand', cursive, sans-serif";

  return hasDevanagariText(text)
    ? "'Noto Serif Devanagari', 'Mangal', 'Kokila', 'DejaVu Sans', 'Segoe Print', 'Bradley Hand', cursive, sans-serif"
    : handwritingStack;
};

const loadTemplateBuffer = () => {
  const templatePath = path.join(process.cwd(), 'public', 'receipt-template.png');

  if (!fs.existsSync(templatePath)) {
    throw new Error('Receipt template image not found at public/receipt-template.png. Please save the template image there.');
  }

  return fs.readFileSync(templatePath);
};

const loadEmbeddedFontCss = () => {
  if (embeddedFontCss !== null) {
    return embeddedFontCss;
  }

  const fontsDir = path.join(process.cwd(), 'public', 'fonts', 'receipt');

  // Prefer woff2 when available, fall back to woff
  const latinRegular = fs.existsSync(path.join(fontsDir, 'noto-serif-latin-400-normal.woff2'))
    ? path.join(fontsDir, 'noto-serif-latin-400-normal.woff2')
    : path.join(fontsDir, 'noto-serif-latin-400-normal.woff');
  const latinBold = fs.existsSync(path.join(fontsDir, 'noto-serif-latin-700-normal.woff2'))
    ? path.join(fontsDir, 'noto-serif-latin-700-normal.woff2')
    : path.join(fontsDir, 'noto-serif-latin-700-normal.woff');

  const devanagariRegular = fs.existsSync(path.join(fontsDir, 'noto-serif-devanagari-devanagari-400-normal.woff2'))
    ? path.join(fontsDir, 'noto-serif-devanagari-devanagari-400-normal.woff2')
    : path.join(fontsDir, 'noto-serif-devanagari-devanagari-400-normal.woff');
  const devanagariBold = fs.existsSync(path.join(fontsDir, 'noto-serif-devanagari-devanagari-700-normal.woff2'))
    ? path.join(fontsDir, 'noto-serif-devanagari-devanagari-700-normal.woff2')
    : path.join(fontsDir, 'noto-serif-devanagari-devanagari-700-normal.woff');

  if (!fs.existsSync(latinRegular) || !fs.existsSync(latinBold)) {
    throw new Error('Receipt Latin font files are missing in public/fonts/receipt.');
  }

  if (!fs.existsSync(devanagariRegular) || !fs.existsSync(devanagariBold)) {
    throw new Error('Receipt Devanagari font files are missing in public/fonts/receipt.');
  }

  const latinRegularBase64 = fs.readFileSync(latinRegular).toString('base64');
  const latinBoldBase64 = fs.readFileSync(latinBold).toString('base64');
  const devanagariRegularBase64 = fs.readFileSync(devanagariRegular).toString('base64');
  const devanagariBoldBase64 = fs.readFileSync(devanagariBold).toString('base64');

  const latinFormat = latinRegular.endsWith('.woff2') ? 'woff2' : 'woff';
  const devanagariFormat = devanagariRegular.endsWith('.woff2') ? 'woff2' : 'woff';

  const latinMimeType = latinFormat === 'woff2' ? 'application/font-woff2' : 'application/font-woff';
  const devanagarMimeType = devanagariFormat === 'woff2' ? 'application/font-woff2' : 'application/font-woff';

  embeddedFontCss = `
    @font-face {
      font-family: 'ReceiptLatin';
      src: url(data:${latinMimeType};base64,${latinRegularBase64}) format('${latinFormat}');
      font-weight: 400;
      font-style: normal;
    }
    @font-face {
      font-family: 'ReceiptLatin';
      src: url(data:${latinMimeType};base64,${latinBoldBase64}) format('${latinFormat}');
      font-weight: 700;
      font-style: normal;
    }
    @font-face {
      font-family: 'ReceiptDevanagari';
      src: url(data:${devanagarMimeType};base64,${devanagariRegularBase64}) format('${devanagariFormat}');
      font-weight: 400;
      font-style: normal;
    }
    @font-face {
      font-family: 'ReceiptDevanagari';
      src: url(data:${devanagarMimeType};base64,${devanagariBoldBase64}) format('${devanagariFormat}');
      font-weight: 700;
      font-style: normal;
    }
  `;

  return embeddedFontCss;
};

export async function renderReceiptImage({
  receiptNumber,
  entryDate,
  name,
  phone,
  amount,
  mode,
  collector,
}: {
  receiptNumber: string;
  entryDate: Date;
  name: string;
  phone: string;
  amount: number;
  mode: string;
  collector: string;
}) {
  try {
    const templateBuffer = loadTemplateBuffer();
    const templateMetadata = await sharp(templateBuffer).metadata();
    const receiptWidth = templateMetadata.width ?? BASE_RECEIPT_WIDTH;
    const receiptHeight = templateMetadata.height ?? BASE_RECEIPT_HEIGHT;
    const scaleX = receiptWidth / BASE_RECEIPT_WIDTH;
    const scaleY = receiptHeight / BASE_RECEIPT_HEIGHT;
    const fontScale = Math.min(scaleX, scaleY);
    const formattedDay = format(entryDate, 'dd');
    const formattedMonth = format(entryDate, 'MM');
    const formattedYear = format(entryDate, 'yy');
    const formattedAmount = amount.toLocaleString('en-IN');
    const checkedCash = mode.toLowerCase() === 'cash';

    // Create text overlays as SVG overlays and composite them
    const textOverlays: Array<{ input: Buffer; top: number; left: number }> = [];

    // Helper to create text SVG
    const createTextSvg = (
      text: string,
      size: number,
      weight: number,
      x: number,
      y: number,
      textAnchor: 'start' | 'middle' | 'end' = 'start'
    ) => {
      const encoded = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

      // NOTE: Sharp cannot execute CSS @font-face or use embedded fonts.
      // Use system fonts only. For custom Noto fonts, rely on Puppeteer (primary renderer).
      const isTick = encoded === '✓';
      const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg width="${receiptWidth}" height="${receiptHeight}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${receiptWidth} ${receiptHeight}">
        <text x="${Math.round(x * scaleX)}" y="${Math.round(y * scaleY)}" font-size="${Math.max(12, Math.round(size * fontScale))}" font-weight="${isTick ? 700 : 400}" text-anchor="${textAnchor}" dominant-baseline="${isTick ? 'middle' : 'hanging'}" font-family="${isTick ? "Arial, 'DejaVu Sans', sans-serif" : getTextFontFamily(text)}" fill="#000000">${encoded}</text>
      </svg>`;

      return Buffer.from(svg);
    };

    // Receipt number
    textOverlays.push({
      input: createTextSvg(receiptNumber, FIELD_POSITIONS.receiptNumber.size, 400, FIELD_POSITIONS.receiptNumber.x, FIELD_POSITIONS.receiptNumber.y, 'middle'),
      top: 0,
      left: 0,
    });

    // Date
    textOverlays.push({
      input: createTextSvg(formattedDay, FIELD_POSITIONS.dateDay.size, 400, FIELD_POSITIONS.dateDay.x, FIELD_POSITIONS.dateDay.y, 'middle'),
      top: 0,
      left: 0,
    });

    textOverlays.push({
      input: createTextSvg(formattedMonth, FIELD_POSITIONS.dateMonth.size, 400, FIELD_POSITIONS.dateMonth.x, FIELD_POSITIONS.dateMonth.y, 'middle'),
      top: 0,
      left: 0,
    });

    textOverlays.push({
      input: createTextSvg(formattedYear, FIELD_POSITIONS.dateYear.size, 400, FIELD_POSITIONS.dateYear.x, FIELD_POSITIONS.dateYear.y, 'middle'),
      top: 0,
      left: 0,
    });

    // Name
    textOverlays.push({
      input: createTextSvg(name, FIELD_POSITIONS.name.size, 400, FIELD_POSITIONS.name.x, FIELD_POSITIONS.name.y),
      top: 0,
      left: 0,
    });

    // Phone
    textOverlays.push({
      input: createTextSvg(phone, FIELD_POSITIONS.phone.size, 400, FIELD_POSITIONS.phone.x, FIELD_POSITIONS.phone.y),
      top: 0,
      left: 0,
    });

    // Amount
    textOverlays.push({
      input: createTextSvg(formattedAmount, FIELD_POSITIONS.amount.size, 400, FIELD_POSITIONS.amount.x, FIELD_POSITIONS.amount.y),
      top: 0,
      left: 0,
    });

    // Cash checkbox
    if (checkedCash) {
      textOverlays.push({
        input: createTextSvg('✓', FIELD_POSITIONS.cashCheck.size, 700, FIELD_POSITIONS.cashCheck.x, FIELD_POSITIONS.cashCheck.y, 'middle'),
        top: 0,
        left: 0,
      });
    }

    // UPI checkbox
    if (!checkedCash && mode.toLowerCase() === 'upi') {
      textOverlays.push({
        input: createTextSvg('✓', FIELD_POSITIONS.upiCheck.size, 700, FIELD_POSITIONS.upiCheck.x, FIELD_POSITIONS.upiCheck.y, 'middle'),
        top: 0,
        left: 0,
      });
    }

    // Collector
    textOverlays.push({
      input: createTextSvg(collector, FIELD_POSITIONS.collector.size, 400, FIELD_POSITIONS.collector.x, FIELD_POSITIONS.collector.y),
      top: 0,
      left: 0,
    });

    // Composite all text overlays
    return sharp(templateBuffer)
      .composite(textOverlays)
      .png()
      .toBuffer();
  } catch (error) {
    console.error('Receipt rendering error:', error);
    throw error;
  }
}