/**
 * Promethean Network State - Polymorphic Identifier Auto-Sensing Utility
 * Classifies strings into specific cryptographic types without mutating case-sensitive data.
 */

export type IdentifierType = 
  | 'DID' 
  | 'EVM_ADDRESS' 
  | 'SOLANA_ADDRESS' 
  | 'EVM_TX_HASH' 
  | 'SOLANA_SIGNATURE' 
  | 'ECDSA_SIGNATURE' 
  | 'IPFS_CID' 
  | 'UNKNOWN';

export interface ParsedIdentifier {
  raw: string;
  normalized: string;
  type: IdentifierType;
  chain?: 'solana' | 'ethereum' | 'prmth_mesh' | 'ipfs' | 'unknown';
  length: number;
  label: string;
  isValid: boolean;
}

const BASE58_REGEX = /^[1-9A-HJ-NP-Za-km-z]+$/;
const HEX_REGEX = /^0x[a-fA-F0-9]+$/;

/**
 * Parses and auto-senses the type of any cryptographic identifier up to 258 characters.
 * Preserves case-sensitivity for Base58 (Solana, IPFS) while safely lowercasing EVM hex.
 */
export function parseIdentifier(input: string | null | undefined): ParsedIdentifier {
  if (!input) {
    return {
      raw: '',
      normalized: '',
      type: 'UNKNOWN',
      chain: 'unknown',
      length: 0,
      label: 'Empty Identifier',
      isValid: false,
    };
  }

  const raw = input.trim();
  const len = raw.length;

  // Reject oversized strings beyond the 258-char database boundary
  if (len > 258) {
    return {
      raw,
      normalized: raw,
      type: 'UNKNOWN',
      chain: 'unknown',
      length: len,
      label: 'Exceeds Maximum Length (258 chars)',
      isValid: false,
    };
  }

  // 1. Decentralized Identifier (DID)
  if (raw.startsWith('did:')) {
    return {
      raw,
      normalized: raw,
      type: 'DID',
      chain: 'prmth_mesh',
      length: len,
      label: 'Decentralized Identifier (DID)',
      isValid: true,
    };
  }

  // 2. EVM Address (0x + 40 hex chars = 42 chars)
  if (len === 42 && raw.startsWith('0x') && HEX_REGEX.test(raw)) {
    return {
      raw,
      normalized: raw.toLowerCase(),
      type: 'EVM_ADDRESS',
      chain: 'ethereum',
      length: len,
      label: 'EVM Wallet Address',
      isValid: true,
    };
  }

  // 3. EVM Transaction Hash (0x + 64 hex chars = 66 chars)
  if (len === 66 && raw.startsWith('0x') && HEX_REGEX.test(raw)) {
    return {
      raw,
      normalized: raw.toLowerCase(),
      type: 'EVM_TX_HASH',
      chain: 'ethereum',
      length: len,
      label: 'EVM Transaction Hash',
      isValid: true,
    };
  }

  // 4. ECDSA Signature (0x + 128-132 hex chars)
  if (len >= 130 && len <= 134 && raw.startsWith('0x') && HEX_REGEX.test(raw)) {
    return {
      raw,
      normalized: raw.toLowerCase(),
      type: 'ECDSA_SIGNATURE',
      chain: 'ethereum',
      length: len,
      label: 'ECDSA Signature',
      isValid: true,
    };
  }

  // 5. IPFS CID (CIDv0 46 chars starting with Qm, or CIDv1 starting with bafy)
  if ((len === 46 && raw.startsWith('Qm') && BASE58_REGEX.test(raw)) || raw.startsWith('bafy')) {
    return {
      raw,
      normalized: raw, // Strictly case-sensitive
      type: 'IPFS_CID',
      chain: 'ipfs',
      length: len,
      label: 'IPFS Content ID',
      isValid: true,
    };
  }

  // 6. Solana Signature (Base58, 86-90 chars, usually 87 or 88)
  if (len >= 86 && len <= 90 && BASE58_REGEX.test(raw)) {
    return {
      raw,
      normalized: raw, // Strictly case-sensitive
      type: 'SOLANA_SIGNATURE',
      chain: 'solana',
      length: len,
      label: 'Solana Transaction Signature',
      isValid: true,
    };
  }

  // 7. Solana Public Key / Wallet (Base58, 32-44 chars)
  if (len >= 32 && len <= 44 && BASE58_REGEX.test(raw)) {
    return {
      raw,
      normalized: raw, // Strictly case-sensitive
      type: 'SOLANA_ADDRESS',
      chain: 'solana',
      length: len,
      label: 'Solana Public Key',
      isValid: true,
    };
  }

  return {
    raw,
    normalized: raw,
    type: 'UNKNOWN',
    chain: 'unknown',
    length: len,
    label: 'Generic Identifier',
    isValid: false,
  };
}

/**
 * Truncates an identifier safely for compact HUD displays.
 */
export function formatIdentifierCompact(identifier: string, prefixLen = 6, suffixLen = 4): string {
  if (!identifier) return '';
  if (identifier.length <= prefixLen + suffixLen + 3) return identifier;
  return `${identifier.slice(0, prefixLen)}...${identifier.slice(-suffixLen)}`;
}
