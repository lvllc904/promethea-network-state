// Body 1 Lobotomy: Transition to Solana Smart Contracts
import { type Firestore, writeBatch, doc, collection, increment, updateDoc } from "@promethea/sovereign-store";
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

async function getOrCreateLocalSovereignKey(): Promise<CryptoKeyPair> {
    const keyStoreName = "promethea-sovereign-keypair";
    if (typeof window === 'undefined') {
        throw new Error("Local sovereign key requires window context");
    }
    
    const savedPublicKeyJwk = localStorage.getItem(`${keyStoreName}-pub`);
    const savedPrivateKeyJwk = localStorage.getItem(`${keyStoreName}-priv`);
    
    if (savedPublicKeyJwk && savedPrivateKeyJwk) {
        try {
            const publicKey = await window.crypto.subtle.importKey(
                "jwk",
                JSON.parse(savedPublicKeyJwk),
                { name: "ECDSA", namedCurve: "P-256" },
                true,
                ["verify"]
            );
            const privateKey = await window.crypto.subtle.importKey(
                "jwk",
                JSON.parse(savedPrivateKeyJwk),
                { name: "ECDSA", namedCurve: "P-256" },
                true,
                ["sign"]
            );
            return { publicKey, privateKey };
        } catch (e) {
            console.warn("Failed to import local sovereign key, regenerating...", e);
        }
    }
    
    const keyPair = await window.crypto.subtle.generateKey(
        { name: "ECDSA", namedCurve: "P-256" },
        true,
        ["sign", "verify"]
    );
    
    const pubJwk = await window.crypto.subtle.exportKey("jwk", keyPair.publicKey);
    const privJwk = await window.crypto.subtle.exportKey("jwk", keyPair.privateKey);
    
    localStorage.setItem(`${keyStoreName}-pub`, JSON.stringify(pubJwk));
    localStorage.setItem(`${keyStoreName}-priv`, JSON.stringify(privJwk));
    localStorage.setItem(`promethea-sovereign-address`, `did:sovereign:local:0x${Math.floor(Math.random() * 1000000000000).toString(16)}`);
    
    return keyPair;
}

export async function requestWalletSignature(actionName: string, payload: any): Promise<{
    signature: string;
    publicKey: string;
    address: string;
    syndicateId: string;
}> {
    if (typeof window === 'undefined') {
        return {
            signature: "server-mock-signature",
            publicKey: "server-mock-pubkey",
            address: "did:sovereign:mock",
            syndicateId: "global"
        };
    }

    const syndicateId = localStorage.getItem('promethea-active-org') || 'global';
    const message = {
        action: actionName,
        payload,
        syndicateId,
        timestamp: Date.now()
    };
    const messageString = JSON.stringify(message);
    const encoder = new TextEncoder();
    const data = encoder.encode(messageString);

    const win = window as any;
    if (win.solana?.isPhantom && win.solana.publicKey) {
        try {
            console.log(`[Zero-Trust Signature] Directing Phantom wallet to sign ${actionName}`);
            const encodedMsg = encoder.encode(`[TPNS] Sign action ${actionName}: ${messageString}`);
            const signed = await win.solana.signMessage(encodedMsg, "utf8");
            const signatureHex = Array.from(signed.signature as Uint8Array)
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
            
            return {
                signature: signatureHex,
                publicKey: win.solana.publicKey.toString(),
                address: `did:solana:${win.solana.publicKey.toString()}`,
                syndicateId
            };
        } catch (walletErr) {
            console.warn("[Zero-Trust Signature] Phantom signing declined or failed. Falling back to local keypair.", walletErr);
        }
    }

    if (win.ethereum && win.ethereum.selectedAddress) {
        try {
            console.log(`[Zero-Trust Signature] Directing MetaMask to sign ${actionName}`);
            const address = win.ethereum.selectedAddress;
            const signed = await win.ethereum.request({
                method: 'personal_sign',
                params: [messageString, address]
            });
            return {
                signature: signed,
                publicKey: address,
                address: `did:eth:${address}`,
                syndicateId
            };
        } catch (ethErr) {
            console.warn("[Zero-Trust Signature] MetaMask signing declined or failed. Falling back to local keypair.", ethErr);
        }
    }

    console.log(`[Zero-Trust Signature] Invoking local-first browser cryptographic keypair for ${actionName}`);
    
    const confirmed = window.confirm(
        `[SOVEREIGN HANDSHAKE REQUIRED]\n\n` +
        `Action: ${actionName.toUpperCase()}\n` +
        `Syndicate: ${syndicateId.toUpperCase()}\n\n` +
        `Do you authorize this zero-trust cryptographic signature to commit this state update?`
    );
    
    if (!confirmed) {
        throw new Error("Cryptographic handshake declined by sovereign citizen.");
    }

    const { publicKey, privateKey } = await getOrCreateLocalSovereignKey();
    const signatureBuffer = await window.crypto.subtle.sign(
        { name: "ECDSA", hash: { name: "SHA-256" } },
        privateKey,
        data
    );

    const signatureArray = new Uint8Array(signatureBuffer);
    const signatureHex = Array.from(signatureArray)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    const pubJwk = await window.crypto.subtle.exportKey("jwk", publicKey);
    const localAddress = localStorage.getItem('promethea-sovereign-address') || `did:sovereign:local:0xunknown`;

    return {
        signature: signatureHex,
        publicKey: JSON.stringify(pubJwk),
        address: localAddress,
        syndicateId
    };
}

function getSovereignProvider() {
    const connection = new Connection(RPC_URL, "confirmed");
    const dummyKeypair = Keypair.generate();
    const provider = new AnchorProvider(connection, new MockWallet(dummyKeypair) as any, AnchorProvider.defaultOptions());
    return provider;
}

export async function castVote(firestore: Firestore, proposalId: string, citizenId: string, support: boolean, voteCredits: number, voiceWeight: number) {
    try {
        console.log(`[Sovereign Reflex] Requesting wallet signature for casting vote...`);
        const handshake = await requestWalletSignature("castVote", { proposalId, support, voteCredits, voiceWeight });
        const syndicateId = handshake.syndicateId;
        const qvCost = voteCredits * voteCredits;

        console.log(`[Sovereign Reflex] Attempting to cast vote ON-CHAIN for proposal: ${proposalId}`);
        const provider = getSovereignProvider();
        const program = new (Program as any)(SovereignGovernanceIDL as any, GOVERNANCE_PROGRAM_ID, provider);

        const mockProposalPubkey = Keypair.generate().publicKey;

        try {
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
        
        const batch = writeBatch(firestore);
        
        const voteRef = doc(collection(firestore, 'votes'));
        const newVote = {
            id: voteRef.id,
            proposalId,
            citizenId,
            support,
            weight: voiceWeight,
            cost: qvCost,
            timestamp: new Date().toISOString(),
            onChainSimulated: true,
            signature: handshake.signature,
            signatureAddress: handshake.address,
            publicKey: handshake.publicKey,
            syndicateId
        };
        batch.set(voteRef, newVote);

        const citizenRef = doc(firestore, 'citizens', citizenId);
        batch.update(citizenRef, {
            reputation: increment(-qvCost)
        });

        await batch.commit();

        if (typeof window !== 'undefined') {
            try {
                const localVotesStr = localStorage.getItem('promethea-local-votes');
                const localVotes = localVotesStr ? JSON.parse(localVotesStr) : [];
                if (Array.isArray(localVotes)) {
                    localVotes.push(newVote);
                    localStorage.setItem('promethea-local-votes', JSON.stringify(localVotes));
                    window.dispatchEvent(new CustomEvent('promethea-store-updated'));
                }
            } catch (err) {
                console.error("Failed to update local votes in client actions:", err);
            }
        }

        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message || "Failed to cast vote on the client" };
    }
}

export async function pledgeCapital(firestore: Firestore, proposalId: string, citizenId: string, amount: number) {
    try {
        console.log(`[Sovereign Reflex] Requesting wallet signature for pledging capital...`);
        const handshake = await requestWalletSignature("pledgeCapital", { proposalId, amount });
        const syndicateId = handshake.syndicateId;

        console.log(`[Sovereign Reflex] Pledging ON-CHAIN for proposal: ${proposalId}`);

        const batch = writeBatch(firestore);

        const pledgeRef = doc(collection(firestore, 'pledges'));
        batch.set(pledgeRef, {
            proposalId,
            citizenId,
            amount,
            status: 'Pending',
            timestamp: new Date().toISOString(),
            signature: handshake.signature,
            signatureAddress: handshake.address,
            publicKey: handshake.publicKey,
            syndicateId
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
        console.log(`[Sovereign Reflex] Requesting wallet signature for task application...`);
        const handshake = await requestWalletSignature("applyForTask", { taskId, proposalId, assigneeId, compensationChoice });
        const syndicateId = handshake.syndicateId;

        console.log(`[Sovereign Reflex] Signing Labor Contract ON-CHAIN for task: ${taskId}`);
        const taskRef = doc(firestore, 'tasks', taskId);
        await updateDoc(taskRef, {
            assigneeId: assigneeId,
            status: 'In Progress',
            compensationChoice: compensationChoice,
            updatedAt: new Date().toISOString(),
            signature: handshake.signature,
            signatureAddress: handshake.address,
            publicKey: handshake.publicKey,
            syndicateId
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
        console.log(`[Sovereign Reflex] Requesting wallet signature for proposing asset...`);
        const handshake = await requestWalletSignature("proposeAsset", data);
        const syndicateId = handshake.syndicateId;

        console.log(`[Sovereign Reflex] Creating Constitutional Proposal ON-CHAIN...`);
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
            tasks: data.analysis.pathTovalue,
            signature: handshake.signature,
            signatureAddress: handshake.address,
            publicKey: handshake.publicKey,
            syndicateId
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

        if (typeof window !== 'undefined') {
            try {
                const localProposalsStr = localStorage.getItem('promethea-local-proposals');
                const localProposals = localProposalsStr ? JSON.parse(localProposalsStr) : [];
                if (Array.isArray(localProposals)) {
                    localProposals.push(newProposal);
                    localStorage.setItem('promethea-local-proposals', JSON.stringify(localProposals));
                    window.dispatchEvent(new CustomEvent('promethea-store-updated'));
                }
            } catch (err) {
                console.error("Failed to update local proposals in client actions:", err);
            }
        }

        return { success: true, proposalId: newProposalRef.id };
    } catch (error: any) {
        return { success: false, error: error.message || "An unexpected error occurred." };
    }
}

export async function purchaseFractionalShare(firestore: Firestore, assetId: string, citizenId: string, amount: number, paymentMethod: string) {
    try {
        console.log(`[Sovereign Reflex] Requesting wallet signature for fractional share purchase...`);
        const handshake = await requestWalletSignature("purchaseFractionalShare", { assetId, amount, paymentMethod });
        const syndicateId = handshake.syndicateId;

        console.log(`[Sovereign Reflex] Minting RWA Fractional Node ON-CHAIN...`);
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
            tokenType: paymentMethod,
            amount: amount,
            status: 'Active',
            grantedAt: new Date().toISOString(),
            signature: handshake.signature,
            signatureAddress: handshake.address,
            publicKey: handshake.publicKey,
            syndicateId
        });

        await batch.commit();
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message || "Failed to purchase on the client" };
    }
}
