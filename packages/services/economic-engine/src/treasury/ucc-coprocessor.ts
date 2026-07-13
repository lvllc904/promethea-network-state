import axios from 'axios';

export interface UCC1FilingRequest {
    debtorName: string;
    debtorAddress?: string;
    securedPartyName: string;
    securedPartyAddress?: string;
    collateralDescription: string;
    state?: string;
    tokenMintAddress: string;
}

export interface UCCFilingResult {
    status: 'success' | 'failure';
    searchResult: {
        debtorName: string;
        searchTimestamp: string;
        priorLiensFound: boolean;
        activeLienCount: number;
        liens: Array<any>;
    };
    draft: {
        debtorName: string;
        debtorAddress: string;
        securedPartyName: string;
        securedPartyAddress: string;
        collateralDescription: string;
        jurisdictionState: string;
        documentId: string;
        createdAt: string;
    };
    receipt: {
        filingId: string;
        status: string;
        timestamp: string;
        jurisdiction: string;
        stateReceiptHash: string;
        documentUrl: string;
    };
    cerSignature: string;
    isArticle12Compliant: boolean;
}

/**
 * UCC Coprocessor Delegate Service
 * 
 * Interfaces with the DepthOS Bridge (Body 3 running on localhost:9999) 
 * to securely draft and submit UCC-1 filings and Article 12 control signatures.
 * This encapsulates secure cryptographic operations within the sovereign container boundary.
 */
export class UCCCoprocessorDelegate {
    private static DEPTHOS_BRIDGE_URL = 'http://localhost:9999';

    /**
     * Sends a request to DepthOS Bridge to perform the full draft-and-file UCC sequence.
     */
    public async draftAndFileUCC1(request: UCC1FilingRequest): Promise<UCCFilingResult> {
        console.log(`[UCC Coprocessor Delegate] Delegating UCC-1 filing for "${request.debtorName}" to DepthOS Bridge...`);

        try {
            const response = await axios.post(`${UCCCoprocessorDelegate.DEPTHOS_BRIDGE_URL}/api/ucc/draft-and-file`, request, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.data && response.data.status === 'success') {
                console.log(`[UCC Coprocessor Delegate] UCC-1 filing successfully processed. Filing ID: ${response.data.receipt.filingId}`);
                return response.data as UCCFilingResult;
            } else {
                throw new Error(response.data?.error || 'Unknown error response from DepthOS Bridge');
            }
        } catch (err: any) {
            console.error(`[UCC Coprocessor Delegate] Failed to draft and file UCC-1 statement:`, err.message);
            throw new Error(`UCC Coprocessor Delegation Failed: ${err.message}`);
        }
    }

    /**
     * Checks if the DepthOS Bridge is online and accessible.
     */
    public async checkBridgeHealth(): Promise<boolean> {
        try {
            const response = await axios.get(`${UCCCoprocessorDelegate.DEPTHOS_BRIDGE_URL}/health`);
            return response.data && response.data.status === 'online';
        } catch (_) {
            return false;
        }
    }
}

export const uccCoprocessorDelegate = new UCCCoprocessorDelegate();
export const uccCoprocessor = uccCoprocessorDelegate; // Export alias to match naming conventions
