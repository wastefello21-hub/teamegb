import { renderReceiptImage as renderWithSharp } from './receiptRenderer';
import { renderReceiptImage as renderWithSvg } from './receiptRendererSvg';
import { renderReceiptImage as renderWithPuppeteer } from './receiptRendererPuppeteer';

type RenderParams = Parameters<typeof renderWithPuppeteer>[0];

export async function renderReceiptImage(params: RenderParams) {
  const receiptNumber = params.receiptNumber || 'unknown';
  
  try {
    // Prefer SVG renderer first (fast, deterministic, fonts embedded)
    console.info(`[Receipt ${receiptNumber}] Attempting SVG renderer...`);
    const resultSvg = await renderWithSvg(params);
    console.info(`[Receipt ${receiptNumber}] SVG renderer succeeded`);
    return resultSvg;
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    console.warn(`[Receipt ${receiptNumber}] SVG renderer failed: ${errorMsg}. Falling back to Puppeteer then Sharp.`);

    try {
      console.info(`[Receipt ${receiptNumber}] Attempting Puppeteer renderer...`);
      const result = await renderWithPuppeteer(params);
      console.info(`[Receipt ${receiptNumber}] Puppeteer renderer succeeded`);
      return result;
    } catch (err2: any) {
      const error2Msg = err2?.message || String(err2);
      console.warn(`[Receipt ${receiptNumber}] Puppeteer renderer failed: ${error2Msg}. Falling back to Sharp renderer.`);
      try {
        console.info(`[Receipt ${receiptNumber}] Attempting Sharp renderer...`);
        const resultSharp = await renderWithSharp(params);
        console.info(`[Receipt ${receiptNumber}] Sharp renderer succeeded`);
        return resultSharp;
      } catch (err3: any) {
        const error3Msg = err3?.message || String(err3);
        console.error(`[Receipt ${receiptNumber}] All renderers failed: ${error3Msg}`);
        throw err3;
      }
    }
  }
}

export default renderReceiptImage;
