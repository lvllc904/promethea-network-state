
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
    const payload: ActionGetResponse = {
        title: "Onboard to the Promethean Network State",
        icon: "https://lvhllc.org/api/og?title=Join%20Promethea",
        description: "Initialize your sovereign identity and claim your first 100 UVT (Universal Value Tokens) to participate in governance.",
        label: "Onboard (0.01 SOL)",
        links: {
            actions: [
                {
                    type: 'transaction',
                    label: "Initialize Identity (0.01 SOL)",
                    href: "https://lvhllc.org/api/actions/onboarding",
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
        const body: ActionPostRequest = await req.json();
        let account: PublicKey;
        try {
            account = new PublicKey(body.account);
        } catch (err) {
            throw new Error("Invalid account identity");
        }

        const connection = new Connection(clusterApiUrl("mainnet-beta"));
        const destination = new PublicKey("960903D1E4FBA49284C325d27249e166496F3535"); // Reserve Authority

        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: account,
                toPubkey: destination,
                lamports: 0.01 * LAMPORTS_PER_SOL,
            })
        );

        transaction.feePayer = account;
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

        const payload: ActionPostResponse = await createPostResponse({
            fields: {
                type: 'transaction',
                transaction,
                message: "Welcome Citizen! Your sovereign identity is being synchronized with the Ledger.",
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
