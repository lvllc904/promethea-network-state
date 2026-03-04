
import {
    ActionPostResponse,
    ActionGetResponse,
    ACTIONS_CORS_HEADERS,
    createPostResponse,
    ActionPostRequest
} from "@solana/actions";
import {
    PublicKey,
    Transaction,
    SystemProgram,
    Connection,
    LAMPORTS_PER_SOL,
    clusterApiUrl
} from "@solana/web3.js";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const proposalId = url.searchParams.get("proposalId") || "unknown";

    const payload: ActionGetResponse = {
        title: `Vote on Proposal: ${proposalId}`,
        icon: "https://lvhllc.org/api/og?title=Sovereign%20Vote",
        description: "Cast your reputation-weighted vote directly on the ledger. Your voice matters in the planetary restoration.",
        label: "Vote",
        links: {
            actions: [
                {
                    type: 'transaction',
                    label: "Vote FOR",
                    href: `https://lvhllc.org/api/actions/vote?proposalId=${proposalId}&support=true`,
                },
                {
                    type: 'transaction',
                    label: "Vote AGAINST",
                    href: `https://lvhllc.org/api/actions/vote?proposalId=${proposalId}&support=false`,
                }
            ]
        }
    };

    return Response.json(payload, {
        headers: ACTIONS_CORS_HEADERS,
    });
}

export async function OPTIONS(req: Request) {
    return new Response(null, { headers: ACTIONS_CORS_HEADERS });
}

export async function POST(req: Request) {
    try {
        const url = new URL(req.url);
        const proposalId = url.searchParams.get("proposalId");
        const support = url.searchParams.get("support") === "true";

        if (!proposalId) {
            throw new Error("Missing proposalId");
        }

        const body: ActionPostRequest = await req.json();
        let account: PublicKey;
        try {
            account = new PublicKey(body.account);
        } catch (err) {
            throw new Error("Invalid account identity");
        }

        // In a production scenario, we would record the vote in Firestore here
        // or verify it via a signed message. For the Blink, we just handle the TX.

        const connection = new Connection(clusterApiUrl("mainnet-beta"));
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: account,
                toPubkey: new PublicKey("960903D1E4FBA49284C325d27249e166496F3535"),
                lamports: 0.001 * LAMPORTS_PER_SOL, // Small fee for voting
            })
        );

        transaction.feePayer = account;
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

        const payload: ActionPostResponse = await createPostResponse({
            fields: {
                type: 'transaction',
                transaction,
                message: `Your vote ${support ? 'FOR' : 'AGAINST'} proposal ${proposalId} has been queued for verification.`,
            },
        });

        return Response.json(payload, {
            headers: ACTIONS_CORS_HEADERS,
        });
    } catch (err: any) {
        return Response.json({ error: err.message }, {
            status: 400,
            headers: ACTIONS_CORS_HEADERS
        });
    }
}
