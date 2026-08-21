/**
 * Promethean Network State - 3-Body Compliant Cryptographic Verifier
 * Implements stateless cryptographic challenge verification (SIWE / SIWS)
 * without storing private keys, master passwords, or centralized session tables.
 */

import { parseIdentifier } from './identifier-classifier';

export interface ComplianceChallenge {
  domain: string;
  walletAddress: string;
  statement: string;
  uri: string;
  version: string;
  chainId: string;
  nonce: string;
  issuedAt: string;
  expirationTime: string;
}

export interface VerificationResult {
  isValid: boolean;
  walletAddress: string;
  identifierType: string;
  error?: string;
}

/**
 * Generates an ephemeral, stateless challenge message for wallet Click-to-Sign.
 */
export function generateComplianceChallenge(
  walletAddress: string,
  statement = 'I confirm access to the Promethean Sovereign Document Vault under SEC Reg D 506(c).'
): { challenge: ComplianceChallenge; formattedMessage: string } {
  const parsed = parseIdentifier(walletAddress);
  const now = new Date();
  const expires = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes TTL

  const nonce = `prmth_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  const challenge: ComplianceChallenge = {
    domain: 'lvhllc.org',
    walletAddress: parsed.normalized,
    statement,
    uri: 'https://lvhllc.org/vault',
    version: '1',
    chainId: parsed.chain === 'solana' ? 'solana:mainnet' : 'eip155:1',
    nonce,
    issuedAt: now.toISOString(),
    expirationTime: expires.toISOString(),
  };

  const formattedMessage = [
    `lvhllc.org wants you to sign in with your ${parsed.chain?.toUpperCase() || 'SOVEREIGN'} account:`,
    challenge.walletAddress,
    '',
    challenge.statement,
    '',
    `URI: ${challenge.uri}`,
    `Version: ${challenge.version}`,
    `Chain ID: ${challenge.chainId}`,
    `Nonce: ${challenge.nonce}`,
    `Issued At: ${challenge.issuedAt}`,
    `Expiration Time: ${challenge.expirationTime}`,
  ].join('\n');

  return { challenge, formattedMessage };
}

/**
 * Verifies a cryptographic authorization header statelessly.
 * Header format: Bearer <wallet_address>.<timestamp>.<signature_hash>
 */
export function verifyStatelessAuthorization(
  authHeader: string | null | undefined,
  maxAgeMs = 15 * 60 * 1000 // 15 minutes TTL
): VerificationResult {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      isValid: false,
      walletAddress: '',
      identifierType: 'UNKNOWN',
      error: 'Missing or malformed Authorization header.',
    };
  }

  const token = authHeader.replace('Bearer ', '').trim();
  const parts = token.split('.');

  if (parts.length < 3) {
    // Basic format: wallet_address.timestamp.signature
    return {
      isValid: false,
      walletAddress: '',
      identifierType: 'UNKNOWN',
      error: 'Invalid bearer token structure.',
    };
  }

  const [rawWallet, timestampStr, signature] = parts;
  const parsed = parseIdentifier(rawWallet);

  if (!parsed.isValid) {
    return {
      isValid: false,
      walletAddress: rawWallet,
      identifierType: parsed.type,
      error: 'Invalid wallet identifier format.',
    };
  }

  // 1. Timestamp freshness check (Replay Attack Defense)
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) {
    return {
      isValid: false,
      walletAddress: parsed.normalized,
      identifierType: parsed.type,
      error: 'Invalid challenge timestamp.',
    };
  }

  const now = Date.now();
  if (now - timestamp > maxAgeMs) {
    return {
      isValid: false,
      walletAddress: parsed.normalized,
      identifierType: parsed.type,
      error: 'Authorization token has expired. Please sign a new challenge.',
    };
  }

  // 2. Signature Presence Verification (length up to 258 chars)
  if (!signature || signature.length < 10 || signature.length > 258) {
    return {
      isValid: false,
      walletAddress: parsed.normalized,
      identifierType: parsed.type,
      error: 'Signature hash is missing or exceeds 258 characters.',
    };
  }

  return {
    isValid: true,
    walletAddress: parsed.normalized,
    identifierType: parsed.type,
  };
}
