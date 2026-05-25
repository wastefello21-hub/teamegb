import { renderReceiptImage as renderWithSharp } from './receiptRenderer';

type RenderParams = Parameters<typeof renderWithSharp>[0];

export async function renderReceiptImage(params: RenderParams) {
  const receiptNumber = params.receiptNumber || 'unknown';
  try {
    console.info(`[Receipt ${receiptNumber}] Rendering with Sharp renderer...`);
    const result = await renderWithSharp(params);
    console.info(`[Receipt ${receiptNumber}] Sharp renderer succeeded`);
    return result;
  } catch (err: any) {
    console.error(`[Receipt ${receiptNumber}] Sharp renderer failed:`, err);
    throw err;
  }
}

export default renderReceiptImage;
