'use server';

export async function handleUnderwrite(data: any): Promise<any | { error: string }> {
    try {
        const aiServiceUrl = process.env.AI_SERVICE_URL || process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:4002';
        const response = await fetch(`${aiServiceUrl}/api/underwrite-rwa`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const resData = await response.json();
            throw new Error(resData.error || 'Failed to underwrite');
        }
        return await response.json();
    } catch (error: any) {
        console.error("Error in handleUnderwrite action: ", error);
        return { error: error.message || "An unexpected error occurred during underwriting." };
    }
}

export async function handleAutoList(documents: string): Promise<any | { error: string }> {
    try {
        const aiServiceUrl = process.env.AI_SERVICE_URL || process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:4002';
        const response = await fetch(`${aiServiceUrl}/api/auto-list-rwa`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ documents })
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to auto list');
        }
        return await response.json();
    } catch (error: any) {
        console.error("Error in handleAutoList action: ", error);
        return { error: error.message || "An unexpected error occurred during auto-listing." };
    }
}
