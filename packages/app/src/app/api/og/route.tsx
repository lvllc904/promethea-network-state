
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // ?title=<title>
        const hasTitle = searchParams.has('title');
        const title = hasTitle
            ? searchParams.get('title')?.slice(0, 100)
            : 'Promethean Network State';

        return new ImageResponse(
            (
                <div
                    style={{
                        backgroundColor: 'black',
                        backgroundSize: '150px 150px',
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        textAlign: 'center',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        flexWrap: 'nowrap',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            justifyItems: 'center',
                        }}
                    >
                        <div
                            style={{
                                fontSize: 60,
                                fontStyle: 'normal',
                                letterSpacing: '-0.025em',
                                color: 'white',
                                marginTop: 30,
                                padding: '0 120px',
                                lineHeight: 1.4,
                                whiteSpace: 'pre-wrap',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                            }}
                        >
                            {title}
                        </div>
                    </div>
                    <div
                        style={{
                            fontSize: 24,
                            color: 'rgba(255,255,255,0.6)',
                            marginTop: 20,
                            textTransform: 'uppercase',
                            letterSpacing: '0.2em',
                        }}
                    >
                        Sovereign Substrate
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    } catch (e: any) {
        console.log(`${e.message}`);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
