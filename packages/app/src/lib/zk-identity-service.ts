import axios from 'axios';

export interface ZKEncryptedDocument {
    iv: string;
    encryptedData: string;
    authTag: string;
    algorithm: string;
    mimeType: string;
    hash: string;
}

export interface ZKVerifiableCredential {
    context: string[];
    id: string;
    type: string[];
    issuer: string;
    issuanceDate: string;
    expirationDate?: string;
    credentialSubject: {
        id: string;
        [key: string]: any;
    };
    proof: {
        type: string;
        created: string;
        proofPurpose: string;
        verificationMethod: string;
        jws: string;
    };
}

export interface ZKProofResult {
    proofVerified: boolean;
    credentialHash: string;
    timestamp: string;
}

/**
 * Local ZK-Identity Client Service
 * 
 * Invokes the localized ZKIdentityService running inside the DepthOS Bridge
 * daemon on `localhost:9999` (Body 3). This guarantees that sensitive 
 * citizen passport and identification scans never traverse Web2 network interfaces or public block explorers.
 */
export class ZKIdentityClient {
    private static DEPTHOS_BRIDGE_URL = 'http://localhost:9999';

    /**
     * Sends raw passport data locally to the DepthOS Vault for AES-GCM-256 encryption.
     */
    public async encryptDocumentOnEdge(
        rawText: string,
        mimeType: string,
        passphraseOrKey: string
    ): Promise<ZKEncryptedDocument> {
        console.log('[ZKIdentityClient] Delegating local document encryption to DepthOS Bridge...');
        
        try {
            const response = await axios.post(`${ZKIdentityClient.DEPTHOS_BRIDGE_URL}/api/zk/encrypt`, {
                documentData: rawText,
                mimeType,
                passphrase: passphraseOrKey
            });

            if (response.data && response.data.status === 'success') {
                return response.data.encrypted as ZKEncryptedDocument;
            } else {
                throw new Error(response.data?.error || 'Encryption failed on DepthOS Bridge');
            }
        } catch (err: any) {
            console.error('[ZKIdentityClient] Encryption failed:', err.message);
            throw new Error(`ZK-Identity local loop encryption failed: ${err.message}`);
        }
    }

    /**
     * Requests the generation of a W3C Verifiable Credential and zero-knowledge personhood proof.
     */
    public async generateZKIdentityProof(
        citizenDid: string,
        claims: Record<string, any>
    ): Promise<{ vc: ZKVerifiableCredential; proof: ZKProofResult }> {
        console.log(`[ZKIdentityClient] Requesting zero-knowledge passport credential for DID: ${citizenDid}`);

        try {
            const response = await axios.post(`${ZKIdentityClient.DEPTHOS_BRIDGE_URL}/api/zk/generate-vc`, {
                citizenDid,
                claims
            });

            if (response.data && response.data.status === 'success') {
                return {
                    vc: response.data.vc as ZKVerifiableCredential,
                    proof: response.data.zkProof as ZKProofResult
                };
            } else {
                throw new Error(response.data?.error || 'VC generation failed on DepthOS Bridge');
            }
        } catch (err: any) {
            console.error('[ZKIdentityClient] ZK VC Generation failed:', err.message);
            throw new Error(`ZK-Identity proof generation failed: ${err.message}`);
        }
    }

    /**
     * Checks if the local identity daemon is online.
     */
    public async isDaemonOnline(): Promise<boolean> {
        try {
            const response = await axios.get(`${ZKIdentityClient.DEPTHOS_BRIDGE_URL}/health`);
            return response.data && response.data.status === 'online';
        } catch (_) {
            return false;
        }
    }
}

export const zkIdentityClient = new ZKIdentityClient();
export const zkIdentityService = zkIdentityClient; // Export alias to match naming conventions
