'use server';

export async function handleAllocate(taskData: any): Promise<any | { error: string }> {
    try {
        const aiServiceUrl = process.env.AI_SERVICE_URL || process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:4002';
        const response = await fetch(`${aiServiceUrl}/api/allocate-rwa-tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to allocate task');
        }
        return await response.json();
    } catch (error: any) {
        console.error("Error in handleAllocate action: ", error);
        return { error: error.message || "An unexpected error occurred." };
    }
}
