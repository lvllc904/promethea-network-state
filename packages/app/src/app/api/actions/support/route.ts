
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
        title: "Support the Promethean Network State",
        icon: "https://lvhllc.org/api/og?title=Support%20Promethea",
        description: "Your contribution directly funds the autonomous expansion of the sovereign infrastructure. Join the planetary buy-back.",
        label: "Support with 0.1 SOL",
        links: {
            actions: [
                {
                    type: 'transaction',
                    label: "Support with 0.1 SOL",
                    href: "https://lvhllc.org/api/actions/support?amount=0.1",
                },
                {
                    type: 'transaction',
                    label: "Support with 0.5 SOL",
                    href: "https://lvhllc.org/api/actions/support?amount=0.5",
                },
                {
                    type: 'transaction',
                    label: "Custom Amount",
                    href: "https://lvhllc.org/api/actions/support?amount={amount}",
                    parameters: [
                        {
                            name: "amount",
                            label: "Enter SOL amount",
                        }
                    ]
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
        const amountStr = url.searchParams.get("amount") || "0.1";
        const amount = parseFloat(amountStr);

        if (isNaN(amount) || amount <= 0) {
            throw new Error("Invalid amount");
        }

        const body: ActionPostRequest = await req.json();
        let account: PublicKey;
        try {
            account = new PublicKey(body.account);
        } catch (err) {
            throw new Error("Invalid account prototype");
        }

        const connection = new Connection(clusterApiUrl("mainnet-beta"));
        const destination = new PublicKey("960903D1E4FBA49284C325d27249e166496F3535"); // Reserve Authority

        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: account,
                toPubkey: destination,
                lamports: amount * LAMPORTS_PER_SOL,
            })
        );

        transaction.feePayer = account;
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

        const payload: ActionPostResponse = await createPostResponse({
            fields: {
                type: 'transaction',
                transaction,
                message: `Thank you for contributing ${amount} SOL to the Network State!`,
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
