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
    // 5. Generate or Load Base Document Buffer
    let basePdfBytes: Uint8Array;
    const seriesName = req.nextUrl.searchParams.get('series') || 'Series-Wadi-Ham';
    
    // Map document alias to physical files in the New directory
    const fs = await import('fs');
    const path = await import('path');
    const newDir = path.resolve(process.cwd(), '../../New');
    const docMap: Record<string, string> = {
      'substrate': 'The_Sovereign_Substrate.pdf',
      'the-sovereign-substrate': 'The_Sovereign_Substrate.pdf',
      'tactical': 'Promethea_Tactical_Substrate.pdf',
      'promethea-tactical-substrate': 'Promethea_Tactical_Substrate.pdf',
      'lvhllc-specs': 'tpns-lvhllc-onboarding-specs.pdf',
      'miri-homes': 'tpns-miri-homes-briefing-memo.pdf',
      'banking-compliance': 'tpns-banking-compliance-cover-letter.pdf',
      'valuation-report': 'tpns-institutional-valuation-report.pdf',
      'wadi-pitch-deck': 'tpns-wadi-sovereign-pitch-deck-v5.pdf',
    };

    const targetFileName = docMap[documentPath.toLowerCase()];
    const physicalPath = targetFileName ? path.join(newDir, targetFileName) : null;

    if (physicalPath && fs.existsSync(physicalPath)) {
      basePdfBytes = new Uint8Array(fs.readFileSync(physicalPath));
    } else {
      basePdfBytes = await createSamplePpmDocument(seriesName);
    }

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
