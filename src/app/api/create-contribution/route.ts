import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { format } from 'date-fns';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

const RECEIPT_BUCKET = 'e-receipts';
const MAX_RECEIPT_ATTEMPTS = 20;

type ContributionPayload = {
  name?: string;
  house?: string;
  phone?: string;
  amount?: number | string;
  mode?: string;
  collector?: string;
};

const escapeXml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const generateReceiptNumber = () => String(Math.floor(100000 + Math.random() * 900000));

const formatCurrency = (amount: number) => amount.toLocaleString('en-IN');

const loadTemplateBase64 = () => {
  const templatePath = path.join(process.cwd(), 'public', 'receipt-template.png');
  if (!fs.existsSync(templatePath)) {
    throw new Error('Receipt template image not found at public/receipt-template.png. Please save the template image there.');
  }
  const templateBuffer = fs.readFileSync(templatePath);
  return templateBuffer.toString('base64');
};

const buildReceiptSvg = ({
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
  house: string;
}) => {
  const formattedDate = format(entryDate, 'dd / MM / yyyy');
  const checkedCash = mode.toLowerCase() === 'cash';
  const checkedUpi = mode.toLowerCase() === 'upi';
  const templateBase64 = loadTemplateBase64();
  const formattedAmount = amount.toLocaleString('en-IN');

  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="840" viewBox="0 0 1200 840">
    <defs>
      <style>
        .field-value { font-family: 'Georgia', serif; font-size: 32px; font-weight: normal; fill: #1a1a1a; }
        .checkbox-mark { font-family: 'Arial', sans-serif; font-size: 28px; font-weight: bold; fill: #1f6b2d; }
      </style>
    </defs>
    
    <!-- Professional template as background -->
    <image xlink:href="data:image/jpeg;base64,${templateBase64}" width="1200" height="840" />
    
    <!-- Receipt Number (top right area, approximately x=920, y=125) -->
    <text x="980" y="125" class="field-value" text-anchor="middle">${escapeXml(receiptNumber)}</text>
    
    <!-- Date (top right area, approximately x=920, y=195) -->
    <text x="980" y="195" class="field-value" text-anchor="middle">${escapeXml(formattedDate)}</text>
    
    <!-- Name (left side, Name: field, approximately x=520, y=315) -->
    <text x="520" y="315" class="field-value">${escapeXml(name)}</text>
    
    <!-- Mobile Number (left side, Mobile Number: field, approximately x=520, y=385) -->
    <text x="520" y="385" class="field-value">${escapeXml(phone)}</text>
    
    <!-- Amount Contributed (left side, Amount: field, approximately x=520, y=455) -->
    <text x="520" y="455" class="field-value">${escapeXml(formattedAmount)}</text>
    
    <!-- Payment Mode: Cash checkbox (approximately x=390, y=525) -->
    ${checkedCash ? '<text x="400" y="530" class="checkbox-mark">✓</text>' : ''}
    
    <!-- Payment Mode: UPI checkbox (approximately x=620, y=525) -->
    ${checkedUpi ? '<text x="630" y="530" class="checkbox-mark">✓</text>' : ''}
    
    <!-- Collected By (bottom left, Collected By: field, approximately x=330, y=690) -->
    <text x="330" y="690" class="field-value">${escapeXml(collector)}</text>
  </svg>`;
};

async function getDbClient() {
  return supabaseAdmin ?? supabase;
}

async function generateUniqueReceiptNumber() {
  const dbClient = await getDbClient();

  for (let attempt = 0; attempt < MAX_RECEIPT_ATTEMPTS; attempt += 1) {
    const candidate = generateReceiptNumber();
    const { data, error } = await dbClient
      .from('contributions')
      .select('id')
      .eq('receipt_number', candidate)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return candidate;
    }
  }

  throw new Error('Unable to generate a unique receipt number');
}

async function renderReceiptImage(params: {
  receiptNumber: string;
  entryDate: Date;
  name: string;
  phone: string;
  amount: number;
  mode: string;
  collector: string;
  house: string;
}) {
  const svg = buildReceiptSvg(params);
  
  try {
    // Use /tmp for temporary files (works in both local and serverless environments)
    const tmpDir = '/tmp';
    const svgPath = path.join(tmpDir, `receipt-${params.receiptNumber}.svg`);
    
    try {
      fs.writeFileSync(svgPath, svg, 'utf8');
    } catch (writeErr) {
      // If writing to /tmp fails, continue without caching
      console.warn('Failed to cache SVG:', writeErr);
    }

    try {
      return await sharp(Buffer.from(svg)).png().toBuffer();
    } catch (innerErr) {
      console.error('sharp render from buffer failed, attempting from file:', innerErr);
      // Try reading from file if buffer failed
      try {
        return await sharp(svgPath).png().toBuffer();
      } catch (fileErr) {
        console.error('sharp render from file also failed:', fileErr);
        throw fileErr;
      }
    }
  } catch (err) {
    console.error('renderReceiptImage error:', err);
    throw err;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ContributionPayload;
    const name = body.name?.trim();
    const house = body.house?.trim() || 'N/A';
    const phone = body.phone?.trim() || 'N/A';
    const collector = body.collector?.trim();
    const mode = body.mode?.trim() || 'Cash';
    const amount = Number(body.amount);

    if (!name || !collector || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'Name, amount, and collector are required' },
        { status: 400 }
      );
    }

    const entryDate = new Date();
    const receiptNumber = await generateUniqueReceiptNumber();
    const receiptImage = await renderReceiptImage({
      receiptNumber,
      entryDate,
      name,
      phone,
      amount,
      mode,
      collector,
      house,
    });

    const fileName = `receipt-${receiptNumber}.png`;
    const storageClient = supabaseAdmin ?? supabase;

    const { error: uploadError } = await storageClient.storage
      .from(RECEIPT_BUCKET)
      .upload(fileName, receiptImage, {
        upsert: true,
        contentType: 'image/png',
        cacheControl: '31536000'
      });

    if (uploadError) {
      return NextResponse.json(
        {
          error: 'Failed to upload receipt image',
          details: uploadError.message
        },
        { status: 500 }
      );
    }

    const { data: publicData } = storageClient.storage
      .from(RECEIPT_BUCKET)
      .getPublicUrl(fileName);

    const receiptUrl = publicData.publicUrl;
    const dbClient = await getDbClient();

    const contributionRecord = {
      name,
      house,
      phone,
      amount,
      mode,
      date: format(entryDate, 'dd MMM yyyy, hh:mm a'),
      collector,
      receipt_number: receiptNumber,
      receipt_url: receiptUrl,
      receipt_created_at: entryDate.toISOString(),
    };

    const { data: insertedContribution, error: insertError } = await dbClient
      .from('contributions')
      .insert([contributionRecord])
      .select('*')
      .single();

    if (insertError) {
      await storageClient.storage.from(RECEIPT_BUCKET).remove([fileName]);
      return NextResponse.json(
        {
          error: 'Failed to save contribution',
          details: insertError.message
        },
        { status: 500 }
      );
    }

    const { data: collectorMember } = await dbClient
      .from('team_members')
      .select('collections')
      .eq('id', collector)
      .maybeSingle();

    if (collectorMember) {
      const nextCollections = Number(collectorMember.collections || 0) + amount;
      const { error: updateError } = await dbClient
        .from('team_members')
        .update({ collections: nextCollections })
        .eq('id', collector);

      if (updateError) {
        console.warn('Failed to update team member collections:', updateError.message);
      }
    }

    return NextResponse.json(
      {
        success: true,
        contribution: insertedContribution ?? contributionRecord,
        receiptNumber,
        receiptUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Create contribution error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create contribution receipt',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}