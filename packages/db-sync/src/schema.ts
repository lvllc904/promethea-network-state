/**
 * @file db-sync/src/schema.ts
 * @notice Decentralized Schema and Merkle DAG Definitions for P2P Event Synchronization
 * @dev Fulfills Part 3 of the Unified Master Scale Plan. Defines Ceramic and IPFS
 * structures to gossip offline-generated Basic Information Timestamps (BITs) peer-to-peer.
 */

export interface CID {
  "/": string; // IPFS hash reference pointer
}

/**
 * @notice The Basic Information Timestamp (BIT) Structure
 * @dev This is the standard, atomic ledger event emitted locally inside the client's Data Body (Body 3)
 * and verified off-chain using the client's zkVM Guest Prover.
 */
export interface BasicInformationTimestamp {
  version: string;             // e.g., "1.0.0"
  eventId: string;             // Unique cryptographic UUID generated on-device
  senderDid: string;           // W3C compliant decentralized identifier (e.g. did:key:z6M...)
  previousEventCid: CID | null; // Pointer to previous transaction (Merkle DAG linkage)
  
  // Payload Definition
  payload: {
    enclaveId: string;         // The physical ACOM enclave geographic/spatial ID
    actionType: "SWEAT_EQUITY" | "RESOURCE_TRANSFER" | "LEGAL_DECLARATION" | "EXERGY_RECORD";
    description: string;       // Descriptive transaction log
    valueUnits: string;        // Units representing exergy penalty, hours, or asset allocations
    zkProofHash: string;       // Verification ZK proof hash (\Psi) generated via on-device zkVM
  };

  timestamp: number;           // Epoch time when the action was certified on-device
  
  // The Biometric Secure Enclave Signature Block
  signature: {
    curve: "secp256r1" | "ed25519"; // Hardware-bound curves supported by EIP-7212/WebAuthn
    r: string;                 // r signature component
    s: string;                 // s signature component
    publicKeyCredentialId: string; // The physical device secure-hardware public key credential identifier
  };
}

/**
 * @notice The Local State Root Reconciliation Document
 * @dev Represents the aggregated local state root of an enclave, prepared for lazy
 * projection to public settle layers (OP Superchain, Gnosis, etc.).
 */
export interface LocalStateRootReconciliation {
  enclaveId: string;           // Target Smarthood ID
  latestEventCid: CID;         // Head of the local Merkle DAG
  stateRootHash: string;       // Consolidated blended hash (\Psi) representing the local state
  aggregatedProofHash: string; // Aggregated zk-SNARK proof verifying all state transitions
  reconciliationTimestamp: number;
}

/**
 * @notice Ceramic Stream Document Schema Definition
 * @dev Used to bind the Merkle DAG stream structure on the Ceramic Network.
 */
export const CeramicStreamSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "BasicInformationTimestampStream",
  type: "object",
  properties: {
    version: { type: "string" },
    eventId: { type: "string" },
    senderDid: { type: "string" },
    previousEventCid: {
      type: "object",
      properties: {
        "/": { type: "string" }
      },
      required: ["/"]
    },
    payload: {
      type: "object",
      properties: {
        enclaveId: { type: "string" },
        actionType: { type: "string", enum: ["SWEAT_EQUITY", "RESOURCE_TRANSFER", "LEGAL_DECLARATION", "EXERGY_RECORD"] },
        description: { type: "string" },
        valueUnits: { type: "string" },
        zkProofHash: { type: "string" }
      },
      required: ["enclaveId", "actionType", "description", "valueUnits", "zkProofHash"]
    },
    timestamp: { type: "integer" },
    signature: {
      type: "object",
      properties: {
        curve: { type: "string", enum: ["secp256r1", "ed25519"] },
        r: { type: "string" },
        s: { type: "string" },
        publicKeyCredentialId: { type: "string" }
      },
      required: ["curve", "r", "s", "publicKeyCredentialId"]
    }
  },
  required: ["version", "eventId", "senderDid", "payload", "timestamp", "signature"]
};
