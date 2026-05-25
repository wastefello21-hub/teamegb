import { renderReceiptImage as renderWithSharp } from './receiptRenderer';
import { renderReceiptImage as renderWithPuppeteer } from './receiptRendererPuppeteer';

type RenderParams = Parameters<typeof renderWithPuppeteer>[0];

export async function renderReceiptImage(params: RenderParams) {
  const receiptNumber = params.receiptNumber || 'unknown';
  
  try {
    // Prefer the sharp compositing renderer first so the template image is always rendered.
    console.info(`[Receipt ${receiptNumber}] Attempting Sharp renderer...`);
    const resultSharp = await renderWithSharp(params);
    console.info(`[Receipt ${receiptNumber}] Sharp renderer succeeded`);
    return resultSharp;
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    console.warn(`[Receipt ${receiptNumber}] Sharp renderer failed: ${errorMsg}. Falling back to Puppeteer then SVG.`);

    try {
      console.info(`[Receipt ${receiptNumber}] Attempting Puppeteer renderer...`);
      const result = await renderWithPuppeteer(params);
      console.info(`[Receipt ${receiptNumber}] Puppeteer renderer succeeded`);
      return result;
    } catch (err2: any) {
      const error2Msg = err2?.message || String(err2);
      console.warn(`[Receipt ${receiptNumber}] Puppeteer renderer failed: ${error2Msg}. Falling back to SVG renderer.`);
      try {
        const { renderReceiptImage: renderWithSvg } = await import('./receiptRendererSvg');
        console.info(`[Receipt ${receiptNumber}] Attempting SVG renderer...`);
        const resultSvg = await renderWithSvg(params);
        console.info(`[Receipt ${receiptNumber}] SVG renderer succeeded`);
        return resultSvg;
      } catch (err3: any) {
        const error3Msg = err3?.message || String(err3);
        console.error(`[Receipt ${receiptNumber}] All renderers failed: ${error3Msg}`);
        throw err3;
      }
    }
  }
}

export default renderReceiptImage;
