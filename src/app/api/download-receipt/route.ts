import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const receiptNumber = request.nextUrl.searchParams.get('receiptNumber')?.trim();

    if (!receiptNumber || !/^\d{6}$/.test(receiptNumber)) {
      return NextResponse.json(
        { error: 'A valid 6-digit receipt number is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('contributions')
      .select('receipt_url')
      .eq('receipt_number', receiptNumber)
      .single();

    if (error || !data?.receipt_url) {
      return NextResponse.json(
        { error: 'Receipt not found' },
        { status: 404 }
      );
    }

    const receiptResponse = await fetch(data.receipt_url);

    if (!receiptResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to load receipt file' },
        { status: 502 }
      );
    }

    const contentType = receiptResponse.headers.get('content-type') || 'image/png';
    const buffer = Buffer.from(await receiptResponse.arrayBuffer());

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="receipt-${receiptNumber}.png"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Download receipt error:', error);
    return NextResponse.json(
      { error: 'Failed to download receipt' },
      { status: 500 }
    );
  }
}