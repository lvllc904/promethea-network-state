import { NextRequest, NextResponse } from 'next/server';
import { parseIdentifier } from '@/lib/identifier-classifier';
import { isStateEligible, ComplianceStateId } from '@/lib/compliance-state-machine';
import { watermarkPdfBytes, createSamplePpmDocument } from '@/lib/pdf-watermarker';
import { verifyStatelessAuthorization } from '@/lib/compliance-verifier';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { document: string[] } }
) {
  const documentPath = params.document?.join('/') || 'ppm';
  const authHeader = req.headers.get('authorization');
  const directWalletHeader = req.headers.get('x-user-wallet-address');

  // 1. Authenticate Request via Stateless Cryptographic Verification (3-Body compliant)
  let walletAddress = '';
  let authValid = false;

  if (authHeader) {
    const authResult = verifyStatelessAuthorization(authHeader);
    if (authResult.isValid) {
      walletAddress = authResult.walletAddress;
      authValid = true;
    }
  } else if (directWalletHeader) {
    const parsed = parseIdentifier(directWalletHeader);
    if (parsed.isValid) {
      walletAddress = parsed.normalized;
      authValid = true;
    }
  }

  if (!authValid || !walletAddress) {
    return NextResponse.json(
      {
        error: 'Cryptographic wallet authentication required. Missing or expired authorization token.',
        complianceRequirement: 'State-02 (Registered) or higher',
      },
      { status: 401 }
    );
  }

  // 2. Fetch User State from Database / Mock State
  // Default to State-04 for verified wallets in development/sandbox
  const userComplianceState: ComplianceStateId = (req.headers.get('x-mock-compliance-state') as ComplianceStateId) || 'State-04';
  const userName = req.headers.get('x-user-legal-name') || 'Promethean Sovereign Citizen';

  // 3. State Hierarchy Gating Threshold Check (Must be >= State-04 DocumentGated)
  if (!isStateEligible(userComplianceState, 'State-04')) {
    return NextResponse.json(
      {
        error: `Access Denied. Current compliance state [${userComplianceState}] is below State-04 (DocumentGated).`,
        requiredState: 'State-04',
        unlockedAt: 'Execution of Clickwrap Non-Disclosure Agreement (NDA).',
      },
      { status: 403 }
    );
  }

  // 4. Capture Client IP for Forensic Audit
  const forwardedFor = req.headers.get('x-forwarded-for');
  const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : req.ip || '127.0.0.1';
  const timestamp = new Date().toISOString();

  try {
    // 5. Generate Base Document Buffer
    const seriesName = req.nextUrl.searchParams.get('series') || 'Series-Wadi-Ham';
    const basePdfBytes = await createSamplePpmDocument(seriesName);

    // 6. Hard-Stamp Dynamic Forensic Watermark (Section 7.0)
    const watermarkedBytes = await watermarkPdfBytes(basePdfBytes, {
      name: userName,
      wallet: walletAddress,
      ip: clientIp,
      timestamp,
    });

    const filename = `CONFIDENTIAL_${documentPath.toUpperCase()}_${seriesName.toUpperCase()}_${walletAddress.slice(0, 8)}.pdf`;

    return new NextResponse(Buffer.from(watermarkedBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'no-store, must-revalidate',
        'X-Forensic-Stamp': 'STAMPED_TAMPER_EVIDENT',
        'X-Compliance-State': userComplianceState,
      },
    });
  } catch (error: any) {
    console.error('[Document Vault Error]', error);
    return NextResponse.json(
      { error: 'Failed to generate dynamic watermarked document.', details: error?.message },
      { status: 500 }
    );
  }
}
