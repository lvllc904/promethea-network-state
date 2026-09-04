/**
 * @file schema.ts
 * @notice Decentralized Database & P2P Event Sync Schema Definitions for Ceramic Network & IPFS Merkle DAG.
 * Replaces centralized relational databases with verifiable, asynchronous event streams.
 */

export * from './src/schema';

export interface StateRootProjection {
  stateRootHash: string; // Global State Root Ψ
  height: number;
  latestBitCid: string;
  syncedPeersCount: number;
  lastSyncTimestamp: number;
}

export interface CeramicSchemaDefinition {
  $schema: 'http://json-schema.org/draft-07/schema#';
  title: string;
  type: 'object';
  properties: Record<string, {
    type: string;
    description?: string;
    format?: string;
    items?: Record<string, unknown>;
  }>;
  required: string[];
}

/**
 * Ceramic Schema for Citizen Action BIT Records
 */
export const CitizenActionBitSchema: CeramicSchemaDefinition = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'CitizenActionBIT',
  type: 'object',
  properties: {
    cid: { type: 'string', description: 'Unique IPFS CID for this event node' },
    parentCids: { type: 'array', items: { type: 'string' }, description: 'Ancestry pointers in Merkle DAG' },
    authorDid: { type: 'string', description: 'DID of the citizen or node' },
    actionType: { type: 'string' },
    payload: { type: 'object' },
    timestamp: { type: 'number', format: 'int64' },
    signature: { type: 'string' },
  },
  required: ['cid', 'parentCids', 'authorDid', 'actionType', 'timestamp', 'signature'],
};

/**
 * Ceramic Schema for Land Parcel Claims & Title Registry
 */
export const LandParcelClaimSchema: CeramicSchemaDefinition = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'LandParcelClaim',
  type: 'object',
  properties: {
    parcelId: { type: 'string', description: 'Sovereign Land Parcel Identifier' },
    geoPolygonCoords: { type: 'array', items: { type: 'array' }, description: 'GeoJSON Polygon boundary' },
    ownerTrustDid: { type: 'string', description: 'Perpetual Purpose Trust or Citizen DID' },
    zoningClassification: { type: 'string' },
    exergyBaseline: { type: 'object' },
    registeredAt: { type: 'number' },
  },
  required: ['parcelId', 'geoPolygonCoords', 'ownerTrustDid', 'registeredAt'],
};

/**
 * Local Projection Screen Storage Adapter Interface
 * Enables instant querying of the global state root Ψ from local SQLite or IndexedDB.
 */
export interface ILocalProjectionScreen {
  insertBit(bit: BasicInformationTimestamp): Promise<void>;
  getBitByCid(cid: string): Promise<BasicInformationTimestamp | null>;
  queryAncestryChain(headCid: string, depth?: number): Promise<BasicInformationTimestamp[]>;
  computeStateRoot(): Promise<StateRootProjection>;
}

/**
 * In-Memory & IndexedDB Reference Implementation of Local Projection Screen
 */
export class MerkleDagProjectionScreen implements ILocalProjectionScreen {
  private bitStore = new Map<string, BasicInformationTimestamp>();
  private currentHeadCid: string | null = null;

  public async insertBit(bit: BasicInformationTimestamp): Promise<void> {
    this.bitStore.set(bit.cid, bit);
    this.currentHeadCid = bit.cid;
  }

  public async getBitByCid(cid: string): Promise<BasicInformationTimestamp | null> {
    return this.bitStore.get(cid) || null;
  }

  public async queryAncestryChain(headCid: string, depth = 50): Promise<BasicInformationTimestamp[]> {
    const chain: BasicInformationTimestamp[] = [];
    let currentCid: string | undefined = headCid;
    let currentDepth = 0;

    while (currentCid && currentDepth < depth) {
      const bit = this.bitStore.get(currentCid);
      if (!bit) break;
      chain.push(bit);
      currentCid = bit.parentCids[0]; // Traverse principal branch
      currentDepth++;
    }

    return chain;
  }

  public async computeStateRoot(): Promise<StateRootProjection> {
    return {
      stateRootHash: this.currentHeadCid ? `0xpsi_${this.currentHeadCid.slice(-16)}` : '0x0000000000000000',
      height: this.bitStore.size,
      latestBitCid: this.currentHeadCid || '',
      syncedPeersCount: 1,
      lastSyncTimestamp: Date.now(),
    };
  }
}
