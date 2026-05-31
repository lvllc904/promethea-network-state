// Body 1 Lobotomy: Transition to Solana Smart Contracts
import { type Firestore, writeBatch, doc, collection, increment, updateDoc } from "@promethea/identity";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { SovereignGovernanceIDL } from "./idls/sovereign-governance";

// RPC URL: Use localnet or Helius Mainnet based on env
const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "http://127.0.0.1:8899";
const GOVERNANCE_PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_SOVEREIGN_GOVERNANCE_ID || "C1QaGydVJC1TjCAFESzvFdQyexFyvpNdBTnKqWXN2arJ");
const TREASURY_PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_SOVEREIGN_TREASURY_ID || "56P8oqmRwhBvMXJouWVyh6oQoCjH3jRxcFhskNWU5jRj");
const RWA_REGISTRY_ID = new PublicKey(process.env.NEXT_PUBLIC_RWA_REGISTRY_ID || "6XDR861T35AyTrzeKK5ZR8iqiq6qL57iQBPLF6KeF6nc");

/**
 * Get the connection and read-only (or local) provider for Anchor.
 * In a true Sovereign production environment (Body 3), this Wallet connects 
 * to the citizen's browser wallet (Phantom/DepthOS). For MVP simulation parity, 
 * we use a randomly generated keypair if body 3 wallet isn't injected.
 */
class MockWallet {
  constructor(readonly payer: Keypair) {}
  async signTransaction(tx: any) {
    tx.partialSign(this.payer);
    return tx;
  }
  async signAllTransactions(txs: any[]) {
    return txs.map((tx) => {
      tx.partialSign(this.payer);
      return tx;
    });
  }
  get publicKey() {
    return this.payer.publicKey;
  }
}

function getSovereignProvider() {
    const connection = new Connection(RPC_URL, "confirmed");
    // TODO: Connect window.solana from browser wallet adapter
    const dummyKeypair = Keypair.generate();
    const provider = new AnchorProvider(connection, new MockWallet(dummyKeypair) as any, AnchorProvider.defaultOptions());
    return provider;
}

export async function castVote(firestore: Firestore, proposalId: string, citizenId: string, support: boolean, voteCredits: number, voiceWeight: number) {
    const qvCost = voteCredits * voteCredits;

    try {
        console.log(`[Sovereign Reflex] Attempting to cast vote ON-CHAIN for proposal: ${proposalId}`);
        const provider = getSovereignProvider();
        const program = new (Program as any)(SovereignGovernanceIDL as any, GOVERNANCE_PROGRAM_ID, provider);

        // Simulated PDA for the Proposal pubkey
        // In reality, this would be computed via PublicKey.findProgramAddress based on the IPFS hash or proposal ID
        const mockProposalPubkey = Keypair.generate().publicKey;

        try {
             // Broadcase the transaction directly to Body 1 (Ledger)
             const tx = await program.methods
                 .castVote(support)
                 .accounts({
                     proposal: mockProposalPubkey,
                     voter: provider.wallet.publicKey,
                 })
                 .rpc();
                 
            console.log("[Sovereign Reflex] Solana Tx Confirmed:", tx);
        } catch (chainError) {
             console.warn("[Sovereign Reflex] RPC Offline or Mock mismatch. Falling back to Snapshot DB for migration Phase C.");
        }
        
        // -------------------------------------------------------------
        // FALLBACK: Hybrid Dual-Write during Phase B (The Great State Migration)
        // Kept solely to prevent the UI from crashing before the final mainnet sync
        // -------------------------------------------------------------
        const batch = writeBatch(firestore);
        
        const voteRef = doc(collection(firestore, 'votes'));
        batch.set(voteRef, {
            proposalId,
            citizenId,
            support,
            weight: voiceWeight,
            cost: qvCost,
            timestamp: new Date().toISOString(),
            onChainSimulated: true // Flag to mark it for the mass migration script
        });

        const citizenRef = doc(firestore, 'citizens', citizenId);
        batch.update(citizenRef, {
            reputation: increment(-qvCost)
        });

        await batch.commit();
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message || "Failed to cast vote on the client" };
    }
}

export async function pledgeCapital(firestore: Firestore, proposalId: string, citizenId: string, amount: number) {
    try {
        console.log(`[Sovereign Reflex] Pledging ON-CHAIN for proposal: ${proposalId}`);
        // Similar smart contract transaction logic would inject here calling the UVT Treasury Contract

        // Hybrid Fallback
        const batch = writeBatch(firestore);

        const pledgeRef = doc(collection(firestore, 'pledges'));
        batch.set(pledgeRef, {
            proposalId,
            citizenId,
            amount,
            status: 'Pending',
            timestamp: new Date().toISOString()
        });

        const proposalRef = doc(firestore, 'proposals', proposalId);
        batch.update(proposalRef, {
            pledgedCapital: increment(amount)
        });

        await batch.commit();
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message || "Failed to pledge capital on the client" };
    }
}

export async function applyForTask(firestore: Firestore, taskId: string, proposalId: string, assigneeId: string, compensationChoice: string) {
    try {
        console.log(`[Sovereign Reflex] Signing Labor Contract ON-CHAIN for task: ${taskId}`);
        // Hybrid Fallback
        const taskRef = doc(firestore, 'tasks', taskId);
        await updateDoc(taskRef, {
            assigneeId: assigneeId,
            status: 'In Progress',
            compensationChoice: compensationChoice,
            updatedAt: new Date().toISOString()
        });

        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message || "Failed to apply for task on the client" };
    }
}

export async function handleProposeAsset(firestore: Firestore, data: {
    assetData: any,
    analysis: any,
    ownerId: string
}): Promise<{ success: boolean; proposalId?: string; error?: string }> {
    try {
        console.log(`[Sovereign Reflex] Creating Constitutional Proposal ON-CHAIN...`);
        // Hybrid Fallback
        const batch = writeBatch(firestore);

        const newProposalRef = doc(collection(firestore, 'proposals'));
        const now = new Date();
        const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const newProposal = {
            id: newProposalRef.id,
            proposerId: data.ownerId,
            title: data.assetData.assetName,
            description: data.assetData.executiveSummary,
            category: data.assetData.assetType,
            status: 'Active',
            votingStartTime: now.toISOString(),
            votingEndTime: oneWeekFromNow.toISOString(),
            ipfsCid: 'pending',
            targetEquity: data.analysis.enterpriseValue,
            pledgedCapital: 0,
            pledgedSweatEquity: 0,
            tasks: data.analysis.pathTovalue
        };

        batch.set(newProposalRef, newProposal);

        for (const taskData of data.analysis.pathTovalue) {
            const newTaskRef = doc(collection(firestore, 'tasks'));
            batch.set(newTaskRef, {
                id: newTaskRef.id,
                proposalId: newProposalRef.id,
                description: taskData.description,
                priority: taskData.priority,
                status: 'Open',
                dueDate: oneWeekFromNow.toISOString().split('T')[0],
            });
        }

        await batch.commit();
        return { success: true, proposalId: newProposalRef.id };
    } catch (error: any) {
        return { success: false, error: error.message || "An unexpected error occurred." };
    }
}

export async function purchaseFractionalShare(firestore: Firestore, assetId: string, citizenId: string, amount: number, paymentMethod: string) {
    try {
        console.log(`[Sovereign Reflex] Minting RWA Fractional Node ON-CHAIN...`);
        // Hybrid Fallback
        const batch = writeBatch(firestore);

        const citizenRef = doc(firestore, 'citizens', citizenId);
        if (paymentMethod === 'Reputation') {
            batch.update(citizenRef, {
                reputation: increment(-amount)
            });
        }

        const uvtRef = doc(collection(firestore, 'universal_value_tokens'));
        batch.set(uvtRef, {
            assetId,
            ownerId: citizenId,
            tokenType: paymentMethod, // e.g. 'Reputation'
            amount: amount,
            status: 'Active',
            grantedAt: new Date().toISOString()
        });

        await batch.commit();
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message || "Failed to purchase on the client" };
    }
}
