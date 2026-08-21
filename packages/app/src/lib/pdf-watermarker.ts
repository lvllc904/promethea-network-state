import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

export interface WatermarkMetadata {
  name: string;
  wallet: string;
  ip: string;
  timestamp: string;
}

/**
 * Hard-stamps every page of a confidential PDF document (PPM / LOA) with forensic,
 * anti-leak user identifiers. Includes both margin stamps and a diagonal tamper-evident overlay.
 */
export async function watermarkPdfBytes(
  inputPdfBytes: Uint8Array | ArrayBuffer,
  userMeta: WatermarkMetadata
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(inputPdfBytes);
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const cleanName = (userMeta.name || 'ANONYMOUS CITIZEN').toUpperCase().slice(0, 80);
  const cleanWallet = (userMeta.wallet || 'UNVERIFIED_WALLET').slice(0, 120);
  const cleanIp = userMeta.ip || '0.0.0.0';
  const cleanTimestamp = userMeta.timestamp || new Date().toISOString();

  const footerText = `CONFIDENTIAL · PROPERTY OF ${cleanName} | WALLET: ${cleanWallet} | IP: ${cleanIp} | TIMESTAMP: ${cleanTimestamp}`;
  const diagonalText = `CONFIDENTIAL · ${cleanName} · ${cleanWallet.slice(0, 24)}...`;

  for (const page of pages) {
    const { width, height } = page.getSize();

    // 1. Footer Forensic Stamp (Muted Crimson Alert)
    page.drawText(footerText, {
      x: 36,
      y: 24,
      size: 6.5,
      font: regularFont,
      color: rgb(0.72, 0.18, 0.18),
      opacity: 0.85,
    });

    // 2. Header Document Gating Stamp
    page.drawText(`PROMETHEAN NETWORK STATE · SEC REG D 506(c) · AUTHORIZED COPY`, {
      x: 36,
      y: height - 28,
      size: 6.5,
      font: regularFont,
      color: rgb(0.4, 0.45, 0.5),
      opacity: 0.7,
    });

    // 3. Diagonal Center Tamper-Evident Watermark (prevents footer cropping)
    page.drawText(diagonalText, {
      x: width * 0.15,
      y: height * 0.4,
      size: Math.min(width / 32, 18),
      font: font,
      color: rgb(0.8, 0.2, 0.2),
      opacity: 0.08,
      rotate: degrees(45),
    });
  }

  return await pdfDoc.save();
}

/**
 * Creates a template baseline PDF in memory if none is provided on disk.
 */
export async function createSamplePpmDocument(seriesName = 'Series-Wadi-Ham'): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // Standard US Letter
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page.drawText(`CONFIDENTIAL PRIVATE PLACEMENT MEMORANDUM`, {
    x: 50,
    y: 720,
    size: 16,
    font,
    color: rgb(0.1, 0.15, 0.2),
  });

  page.drawText(`PROMETHEAN NETWORK STATE (TPNS) · DELAWARE SERIES LP (6 DEL. C. § 17-218)`, {
    x: 50,
    y: 695,
    size: 9,
    font: bodyFont,
    color: rgb(0.3, 0.35, 0.4),
  });

  page.drawText(`Series Cell: ${seriesName}`, {
    x: 50,
    y: 660,
    size: 12,
    font,
    color: rgb(0.1, 0.5, 0.35),
  });

  const legalNotice = `
This Memorandum constitutes an offering of fractional LP Interests in ${seriesName} under SEC Regulation D
Rule 506(c). Access is strictly restricted to verified accredited investors.

Pursuant to the Department of the Treasury's June 28, 2024 final digital asset regulations (TD 10000), digital
asset cost-basis accounting is maintained on an individual wallet-by-wallet basis without global asset pooling.

Transfer of $YIELD tokens requires prior General Partner whitelisting and compliance clearance.
  `.trim();

  page.drawText(legalNotice, {
    x: 50,
    y: 620,
    size: 9.5,
    font: bodyFont,
    color: rgb(0.2, 0.2, 0.25),
    lineHeight: 14,
    maxWidth: 512,
  });

  return await pdfDoc.save();
}
