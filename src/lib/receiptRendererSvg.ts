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

const escapeXml = (s: string) =>
  (s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

function loadTemplateBase64() {
  const templatePath = path.join(process.cwd(), 'public', 'receipt-template.png');
  if (!fs.existsSync(templatePath)) throw new Error('Receipt template missing at public/receipt-template.png');
  return fs.readFileSync(templatePath).toString('base64');
}

function loadFontData(name: string, fallback?: string) {
  const fontsDir = path.join(process.cwd(), 'public', 'fonts', 'receipt');
  const candidate = path.join(fontsDir, name);
  if (fs.existsSync(candidate)) return { data: fs.readFileSync(candidate).toString('base64'), file: candidate };
  if (fallback && fs.existsSync(path.join(fontsDir, fallback))) return { data: fs.readFileSync(path.join(fontsDir, fallback)).toString('base64'), file: fallback };
  return null;
}

function buildEmbeddedFontCss() {
  const fontsDir = path.join(process.cwd(), 'public', 'fonts', 'receipt');
  const latinReg = loadFontData('noto-serif-latin-400-normal.woff2', 'noto-serif-latin-400-normal.woff');
  const latinBold = loadFontData('noto-serif-latin-700-normal.woff2', 'noto-serif-latin-700-normal.woff');
  const devReg = loadFontData('noto-serif-devanagari-devanagari-400-normal.woff2', 'noto-serif-devanagari-devanagari-400-normal.woff');
  const devBold = loadFontData('noto-serif-devanagari-devanagari-700-normal.woff2', 'noto-serif-devanagari-devanagari-700-normal.woff');

  const rules: string[] = [];
  if (latinReg) rules.push(`@font-face{font-family:ReceiptLatin;src:url(data:application/font-woff2;base64,${latinReg.data}) format('woff2');font-weight:400;font-style:normal;}`);
  if (latinBold) rules.push(`@font-face{font-family:ReceiptLatin;src:url(data:application/font-woff2;base64,${latinBold.data}) format('woff2');font-weight:700;font-style:normal;}`);
  if (devReg) rules.push(`@font-face{font-family:ReceiptDevanagari;src:url(data:application/font-woff2;base64,${devReg.data}) format('woff2');font-weight:400;font-style:normal;}`);
  if (devBold) rules.push(`@font-face{font-family:ReceiptDevanagari;src:url(data:application/font-woff2;base64,${devBold.data}) format('woff2');font-weight:700;font-style:normal;}`);

  // Fallback family uses serif stacks known to support Latin/Devanagari where possible
  return rules.join('\n');
}

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
  const templateBase64 = loadTemplateBase64();
  const templateBuffer = Buffer.from(templateBase64, 'base64');

  const formattedDay = format(entryDate, 'dd');
  const formattedMonth = format(entryDate, 'MM');
  const formattedYear = format(entryDate, 'yy');
  const formattedAmount = amount.toLocaleString('en-IN');
  const checkedCash = (mode || '').toLowerCase() === 'cash';

  // Build CSS with embedded fonts
  const fontCss = buildEmbeddedFontCss();
  const handwritingStack = "'Segoe Print', 'Bradley Hand', 'Lucida Handwriting', 'Comic Sans MS', 'Segoe Script', 'Snell Roundhand', cursive, sans-serif";

  // Create SVG with background image and positioned text
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="${BASE_RECEIPT_WIDTH}" height="${BASE_RECEIPT_HEIGHT}" viewBox="0 0 ${BASE_RECEIPT_WIDTH} ${BASE_RECEIPT_HEIGHT}">
    <style><![CDATA[
      ${fontCss}
      .t{fill:#000;font-family:${handwritingStack};font-weight:400}
      .tick{fill:#000;font-family:Arial, 'DejaVu Sans', sans-serif;font-weight:700}
    ]]></style>
    <image href="data:image/png;base64,${templateBase64}" x="0" y="0" width="${BASE_RECEIPT_WIDTH}" height="${BASE_RECEIPT_HEIGHT}" />
    <text x="${FIELD_POSITIONS.receiptNumber.x}" y="${FIELD_POSITIONS.receiptNumber.y}" text-anchor="middle" dominant-baseline="middle" font-size="${FIELD_POSITIONS.receiptNumber.size}" class="t">${escapeXml(receiptNumber)}</text>
    <text x="${FIELD_POSITIONS.dateDay.x}" y="${FIELD_POSITIONS.dateDay.y}" text-anchor="middle" dominant-baseline="middle" font-size="${FIELD_POSITIONS.dateDay.size}" class="t">${escapeXml(formattedDay)}</text>
    <text x="${FIELD_POSITIONS.dateMonth.x}" y="${FIELD_POSITIONS.dateMonth.y}" text-anchor="middle" dominant-baseline="middle" font-size="${FIELD_POSITIONS.dateMonth.size}" class="t">${escapeXml(formattedMonth)}</text>
    <text x="${FIELD_POSITIONS.dateYear.x}" y="${FIELD_POSITIONS.dateYear.y}" text-anchor="middle" dominant-baseline="middle" font-size="${FIELD_POSITIONS.dateYear.size}" class="t">${escapeXml(formattedYear)}</text>
    <text x="${FIELD_POSITIONS.name.x}" y="${FIELD_POSITIONS.name.y}" font-size="${FIELD_POSITIONS.name.size}" class="t">${escapeXml(name)}</text>
    <text x="${FIELD_POSITIONS.phone.x}" y="${FIELD_POSITIONS.phone.y}" font-size="${FIELD_POSITIONS.phone.size}" class="t">${escapeXml(phone)}</text>
    <text x="${FIELD_POSITIONS.amount.x}" y="${FIELD_POSITIONS.amount.y}" font-size="${FIELD_POSITIONS.amount.size}" class="t">${escapeXml(formattedAmount)}</text>
    ${checkedCash ? `<text x="${FIELD_POSITIONS.cashCheck.x}" y="${FIELD_POSITIONS.cashCheck.y}" text-anchor="middle" dominant-baseline="middle" font-size="${FIELD_POSITIONS.cashCheck.size}" class="tick">✓</text>` : (mode?.toLowerCase() === 'upi' ? `<text x="${FIELD_POSITIONS.upiCheck.x}" y="${FIELD_POSITIONS.upiCheck.y}" text-anchor="middle" dominant-baseline="middle" font-size="${FIELD_POSITIONS.upiCheck.size}" class="tick">✓</text>` : '')}
    <text x="${FIELD_POSITIONS.collector.x}" y="${FIELD_POSITIONS.collector.y}" font-size="${FIELD_POSITIONS.collector.size}" class="t">${escapeXml(collector)}</text>
  </svg>`;

  // Rasterize with sharp at template size
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return png;
}

export default renderReceiptImage;
