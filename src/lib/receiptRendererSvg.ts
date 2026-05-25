import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { format } from 'date-fns';

const BASE_RECEIPT_WIDTH = 1200;
const BASE_RECEIPT_HEIGHT = 840;

const FIELD_POSITIONS = {
  receiptNumber: { x: 995, y: 136, size: 24 },
  date: { x: 995, y: 212, size: 24 },
  name: { x: 285, y: 378, size: 28 },
  phone: { x: 411, y: 441, size: 28 },
  amount: { x: 515, y: 502, size: 28 },
  cashCheck: { x: 433, y: 561, size: 36 },
  upiCheck: { x: 688, y: 561, size: 36 },
  collector: { x: 231, y: 718, size: 28 },
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

  const formattedDate = format(entryDate, 'dd / MM / yy');
  const formattedAmount = amount.toLocaleString('en-IN');
  const checkedCash = (mode || '').toLowerCase() === 'cash';

  // Build CSS with embedded fonts
  const fontCss = buildEmbeddedFontCss();

  // Create SVG with background image and positioned text
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="${BASE_RECEIPT_WIDTH}" height="${BASE_RECEIPT_HEIGHT}" viewBox="0 0 ${BASE_RECEIPT_WIDTH} ${BASE_RECEIPT_HEIGHT}">
    <style><![CDATA[
      ${fontCss}
      .t{fill:#000;font-family:ReceiptLatin,ReceiptDevanagari,DejaVu Sans, Noto Sans, serif}
    ]]></style>
    <image href="data:image/png;base64,${templateBase64}" x="0" y="0" width="${BASE_RECEIPT_WIDTH}" height="${BASE_RECEIPT_HEIGHT}" />
    <text x="${FIELD_POSITIONS.receiptNumber.x}" y="${FIELD_POSITIONS.receiptNumber.y}" font-size="${FIELD_POSITIONS.receiptNumber.size}" font-weight="700" class="t">${escapeXml(receiptNumber)}</text>
    <text x="${FIELD_POSITIONS.date.x}" y="${FIELD_POSITIONS.date.y}" font-size="${FIELD_POSITIONS.date.size}" font-weight="700" class="t">${escapeXml(formattedDate)}</text>
    <text x="${FIELD_POSITIONS.name.x}" y="${FIELD_POSITIONS.name.y}" font-size="${FIELD_POSITIONS.name.size}" font-weight="700" class="t">${escapeXml(name)}</text>
    <text x="${FIELD_POSITIONS.phone.x}" y="${FIELD_POSITIONS.phone.y}" font-size="${FIELD_POSITIONS.phone.size}" font-weight="700" class="t">${escapeXml(phone)}</text>
    <text x="${FIELD_POSITIONS.amount.x}" y="${FIELD_POSITIONS.amount.y}" font-size="${FIELD_POSITIONS.amount.size}" font-weight="700" class="t">${escapeXml(formattedAmount)}</text>
    ${checkedCash ? `<text x="${FIELD_POSITIONS.cashCheck.x}" y="${FIELD_POSITIONS.cashCheck.y}" font-size="${FIELD_POSITIONS.cashCheck.size}" font-weight="700" class="t">✓</text>` : (mode?.toLowerCase() === 'upi' ? `<text x="${FIELD_POSITIONS.upiCheck.x}" y="${FIELD_POSITIONS.upiCheck.y}" font-size="${FIELD_POSITIONS.upiCheck.size}" font-weight="700" class="t">✓</text>` : '')}
    <text x="${FIELD_POSITIONS.collector.x}" y="${FIELD_POSITIONS.collector.y}" font-size="${FIELD_POSITIONS.collector.size}" font-weight="700" class="t">${escapeXml(collector)}</text>
  </svg>`;

  // Rasterize with sharp at template size
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return png;
}

export default renderReceiptImage;
