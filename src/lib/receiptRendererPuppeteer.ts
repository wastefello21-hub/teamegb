import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer';
import sharp from 'sharp';
import { format } from 'date-fns';

const BASE_RECEIPT_WIDTH = 1200;
const BASE_RECEIPT_HEIGHT = 840;

const FIELD_POSITIONS = {
  receiptNumber: { left: 1112, top: 128, size: 22 },
  dateDay: { left: 1050, top: 204, size: 20 },
  dateMonth: { left: 1100, top: 204, size: 20 },
  dateYear: { left: 1150, top: 204, size: 20 },
  name: { left: 377, top: 378, size: 26 },
  phone: { left: 428, top: 441, size: 26 },
  amount: { left: 535, top: 502, size: 26 },
  cashCheck: { left: 449, top: 561, size: 34 },
  upiCheck: { left: 701, top: 561, size: 34 },
  collector: { left: 272, top: 718, size: 26 },
} as const;

const hasDevanagariText = (text: string) => /[\u0900-\u097F]/.test(text);

const handwritingStack = "'Segoe Print', 'Bradley Hand', 'Lucida Handwriting', 'Comic Sans MS', 'Segoe Script', 'Snell Roundhand', cursive, sans-serif";

const getTextFontFamily = (text: string) =>
  hasDevanagariText(text)
    ? "'Noto Serif Devanagari', 'Mangal', 'Kokila', 'DejaVu Sans', 'Segoe Print', 'Bradley Hand', cursive, sans-serif"
    : handwritingStack;

const loadTemplateBuffer = () => {
  const templatePath = path.join(process.cwd(), 'public', 'receipt-template.png');

  if (!fs.existsSync(templatePath)) {
    throw new Error('Receipt template image not found at public/receipt-template.png.');
  }

  return fs.readFileSync(templatePath);
};

const loadFontsCss = () => {
  const fontsDir = path.join(process.cwd(), 'public', 'fonts', 'receipt');
  const picks = [
    { name: 'ReceiptLatin', regular: 'noto-serif-latin-400-normal.woff2', bold: 'noto-serif-latin-700-normal.woff2', fallbackRegular: 'noto-serif-latin-400-normal.woff', fallbackBold: 'noto-serif-latin-700-normal.woff' },
    { name: 'ReceiptDevanagari', regular: 'noto-serif-devanagari-devanagari-400-normal.woff2', bold: 'noto-serif-devanagari-devanagari-700-normal.woff2', fallbackRegular: 'noto-serif-devanagari-devanagari-400-normal.woff', fallbackBold: 'noto-serif-devanagari-devanagari-700-normal.woff' },
  ];

  const rules: string[] = [];

  for (const p of picks) {
    const regularPath = path.join(fontsDir, p.regular);
    const boldPath = path.join(fontsDir, p.bold);

    let useRegular = regularPath;
    let useBold = boldPath;
    if (!fs.existsSync(useRegular) && p.fallbackRegular) useRegular = path.join(fontsDir, p.fallbackRegular);
    if (!fs.existsSync(useBold) && p.fallbackBold) useBold = path.join(fontsDir, p.fallbackBold);

    if (fs.existsSync(useRegular)) {
      const base64 = fs.readFileSync(useRegular).toString('base64');
      const fmt = useRegular.endsWith('.woff2') ? 'woff2' : 'woff';
      const mimeType = fmt === 'woff2' ? 'application/font-woff2' : 'application/font-woff';
      rules.push(`@font-face { font-family: '${p.name}'; src: url(data:${mimeType};base64,${base64}) format('${fmt}'); font-weight: 400; font-style: normal; }`);
    }

    if (fs.existsSync(useBold)) {
      const base64 = fs.readFileSync(useBold).toString('base64');
      const fmt = useBold.endsWith('.woff2') ? 'woff2' : 'woff';
      const mimeType = fmt === 'woff2' ? 'application/font-woff2' : 'application/font-woff';
      rules.push(`@font-face { font-family: '${p.name}'; src: url(data:${mimeType};base64,${base64}) format('${fmt}'); font-weight: 700; font-style: normal; }`);
    }
  }

  return rules.join('\n');
};

function escapeHtml(text: string) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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
  const templateBuffer = loadTemplateBuffer();
  const templateMetadata = await sharp(templateBuffer).metadata();
  const receiptWidth = templateMetadata.width ?? BASE_RECEIPT_WIDTH;
  const receiptHeight = templateMetadata.height ?? BASE_RECEIPT_HEIGHT;
  const scaleX = receiptWidth / BASE_RECEIPT_WIDTH;
  const scaleY = receiptHeight / BASE_RECEIPT_HEIGHT;
  const fontScale = Math.min(scaleX, scaleY);
  const scaleLeft = (value: number) => Math.round(value * scaleX);
  const scaleTop = (value: number) => Math.round(value * scaleY);
  const scaleSize = (value: number) => Math.max(12, Math.round(value * fontScale));

  const templateBase64 = templateBuffer.toString('base64');
  const fontsCss = loadFontsCss();

  const formattedDay = format(entryDate, 'dd');
  const formattedMonth = format(entryDate, 'MM');
  const formattedYear = format(entryDate, 'yy');
  const formattedAmount = amount.toLocaleString('en-IN');
  const checkedCash = mode?.toLowerCase() === 'cash';

  const html = `<!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <style>
      ${fontsCss}
      html,body{margin:0;padding:0}
      .receipt{width:${receiptWidth}px;height:${receiptHeight}px;position:relative;background-image:url(data:image/png;base64,${templateBase64});background-size:cover;font-family:${handwritingStack}}
      .field{position:absolute;color:#000;line-height:1}
      .receipt-number{left:${scaleLeft(FIELD_POSITIONS.receiptNumber.left)}px;top:${scaleTop(FIELD_POSITIONS.receiptNumber.top)}px;font-weight:400;font-size:${scaleSize(FIELD_POSITIONS.receiptNumber.size)}px}
      .date-day{left:${scaleLeft(FIELD_POSITIONS.dateDay.left)}px;top:${scaleTop(FIELD_POSITIONS.dateDay.top)}px;font-weight:400;font-size:${scaleSize(FIELD_POSITIONS.dateDay.size)}px}
      .date-month{left:${scaleLeft(FIELD_POSITIONS.dateMonth.left)}px;top:${scaleTop(FIELD_POSITIONS.dateMonth.top)}px;font-weight:400;font-size:${scaleSize(FIELD_POSITIONS.dateMonth.size)}px}
      .date-year{left:${scaleLeft(FIELD_POSITIONS.dateYear.left)}px;top:${scaleTop(FIELD_POSITIONS.dateYear.top)}px;font-weight:400;font-size:${scaleSize(FIELD_POSITIONS.dateYear.size)}px}
      .name{left:${scaleLeft(FIELD_POSITIONS.name.left)}px;top:${scaleTop(FIELD_POSITIONS.name.top)}px;font-weight:400;font-size:${scaleSize(FIELD_POSITIONS.name.size)}px}
      .phone{left:${scaleLeft(FIELD_POSITIONS.phone.left)}px;top:${scaleTop(FIELD_POSITIONS.phone.top)}px;font-weight:400;font-size:${scaleSize(FIELD_POSITIONS.phone.size)}px}
      .amount{left:${scaleLeft(FIELD_POSITIONS.amount.left)}px;top:${scaleTop(FIELD_POSITIONS.amount.top)}px;font-weight:400;font-size:${scaleSize(FIELD_POSITIONS.amount.size)}px}
      .check-cash{left:${scaleLeft(FIELD_POSITIONS.cashCheck.left)}px;top:${scaleTop(FIELD_POSITIONS.cashCheck.top)}px;font-weight:700;font-size:${scaleSize(FIELD_POSITIONS.cashCheck.size)}px}
      .check-upi{left:${scaleLeft(FIELD_POSITIONS.upiCheck.left)}px;top:${scaleTop(FIELD_POSITIONS.upiCheck.top)}px;font-weight:700;font-size:${scaleSize(FIELD_POSITIONS.upiCheck.size)}px}
      .collector{left:${scaleLeft(FIELD_POSITIONS.collector.left)}px;top:${scaleTop(FIELD_POSITIONS.collector.top)}px;font-weight:400;font-size:${scaleSize(FIELD_POSITIONS.collector.size)}px}
    </style>
  </head>
  <body>
    <div id="receipt" class="receipt">
      <div class="field receipt-number" style="font-family:${getTextFontFamily(receiptNumber)};text-anchor:middle">${escapeHtml(receiptNumber)}</div>
      <div class="field date-day" style="font-family:${getTextFontFamily(formattedDay)};text-align:center">${escapeHtml(formattedDay)}</div>
      <div class="field date-month" style="font-family:${getTextFontFamily(formattedMonth)};text-align:center">${escapeHtml(formattedMonth)}</div>
      <div class="field date-year" style="font-family:${getTextFontFamily(formattedYear)};text-align:center">${escapeHtml(formattedYear)}</div>
      <div class="field name" style="font-family:${getTextFontFamily(name)}">${escapeHtml(name)}</div>
      <div class="field phone" style="font-family:${getTextFontFamily(phone)}">${escapeHtml(phone)}</div>
      <div class="field amount" style="font-family:${getTextFontFamily(formattedAmount)}">${escapeHtml(formattedAmount)}</div>
      ${checkedCash ? `<div class="field check-cash" style="font-family:Arial, 'DejaVu Sans', sans-serif">✓</div>` : (mode?.toLowerCase() === 'upi' ? `<div class="field check-upi" style="font-family:Arial, 'DejaVu Sans', sans-serif">✓</div>` : '')}
      <div class="field collector" style="font-family:${getTextFontFamily(collector)}">${escapeHtml(collector)}</div>
    </div>
  </body>
  </html>`;

  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: receiptWidth, height: receiptHeight });
    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(async () => {
      if ((document as any).fonts?.ready) {
        await (document as any).fonts.ready;
      }
    });
    const el = await page.$('#receipt');
    if (!el) throw new Error('Receipt element not found in renderer HTML');
    const screenshot = await el.screenshot({ type: 'png' }) as Buffer;
    await page.close();
    return screenshot;
  } finally {
    await browser.close();
  }
}
