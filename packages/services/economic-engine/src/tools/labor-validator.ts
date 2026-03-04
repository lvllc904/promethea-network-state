import { ethers } from 'ethers';

/**
 * Sovereign Labor Validator (Wave 1, Item 3)
 * 
 * Cryptographically signs labor credits (UVT) to ensure auditability and non-repudiation.
 * This establishes the Proof-of-Contribution standard for the Network State.
 */
export class LaborValidator {
    private signer: ethers.Wallet;

    constructor(privateKey?: string) {
        // Fallback to a deterministic key derived from a system secret if not provided
        // In production, this should be a secure environment variable
        const key = privateKey || process.env.SOVEREIGN_PRIVATE_KEY || ethers.hexlify(ethers.randomBytes(32));
        this.signer = new ethers.Wallet(key);
        console.log(`[LaborValidator] Initialized with Authority: ${this.signer.address}`);
    }

    /**
     * Sign a labor credit payload for a model's contribution
     */
    async signLabor(payload: {
        modelDID: string;
        amount: number;
        methodId: string;
        timestamp: number;
    }): Promise<string> {
        const message = this.hashPayload(payload);
        return await this.signer.signMessage(message);
    }

    /**
     * Verify a labor credit signature
     */
    async verifyLabor(
        payload: {
            modelDID: string;
            amount: number;
            methodId: string;
            timestamp: number;
        },
        signature: string
    ): Promise<boolean> {
        try {
            const message = this.hashPayload(payload);
            const recoveredAddress = ethers.verifyMessage(message, signature);
            return recoveredAddress === this.signer.address;
        } catch (error) {
            console.error('[LaborValidator] Verification failed:', error);
            return false;
        }
    }

    /**
     * Get the authority address
     */
    getAuthorityAddress(): string {
        return this.signer.address;
    }

    private hashPayload(payload: any): string {
        // Deterministic stringification for hashing
        return JSON.stringify({
            modelDID: payload.modelDID,
            amount: payload.amount.toString(), // ensure string for consistency
            methodId: payload.methodId,
            timestamp: payload.timestamp
        });
    }
}

// Singleton instance for the engine
export const laborValidator = new LaborValidator();
