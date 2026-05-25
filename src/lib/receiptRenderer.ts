import sharp from 'sharp';
import { format } from 'date-fns';
import {
  devanagariBoldFontBase64,
  devanagariRegularFontBase64,
  latinBoldFontBase64,
  latinRegularFontBase64,
  receiptTemplateBase64,
} from './receiptAssets';

const BASE_RECEIPT_WIDTH = 1200;
const BASE_RECEIPT_HEIGHT = 840;

const FIELD_POSITIONS = {
  receiptNumber: { x: 1112, y: 128, size: 22 },
  dateDay: { x: 958, y: 192, size: 20 },
  dateMonth: { x: 1034, y: 192, size: 20 },
  dateYear: { x: 1142, y: 192, size: 20 },
  name: { x: 377, y: 378, size: 26 },
  phone: { x: 428, y: 441, size: 26 },
  amount: { x: 535, y: 502, size: 26 },
  cashCheck: { x: 449, y: 561, size: 34 },
  upiCheck: { x: 701, y: 561, size: 34 },
  collector: { x: 272, y: 718, size: 26 },
} as const;

let embeddedFontCss: string | null = null;

const hasDevanagariText = (text: string) => /[\u0900-\u097F]/.test(text);

const getFontFamily = (text: string) => (hasDevanagariText(text) ? 'ReceiptDevanagari' : 'ReceiptLatin');

const escapeXml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const loadTemplateBuffer = () => Buffer.from(receiptTemplateBase64, 'base64');

const getFontFormat = (isWoff2: boolean) => (isWoff2 ? 'woff2' : 'woff');

const getMimeType = (format: 'woff' | 'woff2') => (format === 'woff2' ? 'font/woff2' : 'font/woff');

const loadEmbeddedFontCss = (): string => {
  if (embeddedFontCss !== null) {
    return embeddedFontCss;
  }

  const latinRegularBuffer = latinRegularFontBase64;
  const latinBoldBuffer = latinBoldFontBase64;
  const devRegularBuffer = devanagariRegularFontBase64;
  const devBoldBuffer = devanagariBoldFontBase64;

  const latinRegularFormat = getFontFormat(false);
  const latinBoldFormat = getFontFormat(false);
  const devRegularFormat = getFontFormat(false);
  const devBoldFormat = getFontFormat(false);

  embeddedFontCss = `
    @font-face {
      font-family: 'ReceiptLatin';
      src: url(data:${getMimeType(latinRegularFormat)};base64,${latinRegularBuffer}) format('${latinRegularFormat}');
      font-weight: 400;
      font-style: normal;
    }
    @font-face {
      font-family: 'ReceiptLatin';
      src: url(data:${getMimeType(latinBoldFormat)};base64,${latinBoldBuffer}) format('${latinBoldFormat}');
      font-weight: 700;
      font-style: normal;
    }
    @font-face {
      font-family: 'ReceiptDevanagari';
      src: url(data:${getMimeType(devRegularFormat)};base64,${devRegularBuffer}) format('${devRegularFormat}');
      font-weight: 400;
      font-style: normal;
    }
    @font-face {
      font-family: 'ReceiptDevanagari';
      src: url(data:${getMimeType(devBoldFormat)};base64,${devBoldBuffer}) format('${devBoldFormat}');
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
    const fontCss = loadEmbeddedFontCss();

    const renderText = (
      text: string,
      size: number,
      weight: 400 | 700,
      x: number,
      y: number,
      textAnchor: 'start' | 'middle' | 'end' = 'start'
    ) => {
      const renderedSize = Math.max(12, Math.round(size * fontScale));
      const scaledX = Math.round(x * scaleX);
      const scaledY = Math.round(y * scaleY);
      const family = getFontFamily(text);
      return `<text x="${scaledX}" y="${scaledY}" font-size="${renderedSize}" font-weight="${weight}" text-anchor="${textAnchor}" dominant-baseline="alphabetic" font-family="${family}" fill="#000000">${escapeXml(text)}</text>`;
    };

    const renderTick = (x: number, y: number, size: number) => {
      const centerX = Math.round(x * scaleX);
      const centerY = Math.round(y * scaleY);
      const s = Math.max(12, Math.round(size * fontScale));
      const p1x = Math.round(centerX - s * 0.28);
      const p1y = Math.round(centerY + s * 0.02);
      const p2x = Math.round(centerX - s * 0.08);
      const p2y = Math.round(centerY + s * 0.24);
      const p3x = Math.round(centerX + s * 0.32);
      const p3y = Math.round(centerY - s * 0.28);
      const strokeWidth = Math.max(2, Math.round(s * 0.1));
      return `<path d="M ${p1x} ${p1y} L ${p2x} ${p2y} L ${p3x} ${p3y}" fill="none" stroke="#000000" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" />`;
    };

    const svgParts: string[] = [
      renderText(receiptNumber, FIELD_POSITIONS.receiptNumber.size, 400, FIELD_POSITIONS.receiptNumber.x, FIELD_POSITIONS.receiptNumber.y, 'middle'),
      renderText(formattedDay, FIELD_POSITIONS.dateDay.size, 400, FIELD_POSITIONS.dateDay.x, FIELD_POSITIONS.dateDay.y, 'start'),
      renderText(formattedMonth, FIELD_POSITIONS.dateMonth.size, 400, FIELD_POSITIONS.dateMonth.x, FIELD_POSITIONS.dateMonth.y, 'start'),
      renderText(formattedYear, FIELD_POSITIONS.dateYear.size, 400, FIELD_POSITIONS.dateYear.x, FIELD_POSITIONS.dateYear.y, 'start'),
      renderText(name, FIELD_POSITIONS.name.size, 400, FIELD_POSITIONS.name.x, FIELD_POSITIONS.name.y),
      renderText(phone, FIELD_POSITIONS.phone.size, 400, FIELD_POSITIONS.phone.x, FIELD_POSITIONS.phone.y),
      renderText(formattedAmount, FIELD_POSITIONS.amount.size, 400, FIELD_POSITIONS.amount.x, FIELD_POSITIONS.amount.y),
      renderText(collector, FIELD_POSITIONS.collector.size, 400, FIELD_POSITIONS.collector.x, FIELD_POSITIONS.collector.y),
    ];

    if (checkedCash) {
      svgParts.push(renderTick(FIELD_POSITIONS.cashCheck.x, FIELD_POSITIONS.cashCheck.y, FIELD_POSITIONS.cashCheck.size));
    }

    if (!checkedCash && mode.toLowerCase() === 'upi') {
      svgParts.push(renderTick(FIELD_POSITIONS.upiCheck.x, FIELD_POSITIONS.upiCheck.y, FIELD_POSITIONS.upiCheck.size));
    }

    const overlaySvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${receiptWidth}" height="${receiptHeight}" viewBox="0 0 ${receiptWidth} ${receiptHeight}" xmlns="http://www.w3.org/2000/svg">
  <style>
    ${fontCss}
  </style>
  ${svgParts.join('\n  ')}
</svg>`;

    const overlayPng = await sharp(Buffer.from(overlaySvg))
      .png()
      .toBuffer();

    return sharp(templateBuffer)
      .composite([{ input: overlayPng, top: 0, left: 0 }])
      .png()
      .toBuffer();
  } catch (error) {
    console.error('Receipt rendering error:', error);
    throw error;
  }
}