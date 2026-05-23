// Sovereign Admin Substrate (Phase C Decommission)
export const db = {
    collection: (name: string) => {
        const mockCol = {
            doc: (id: string) => ({
                get: async (...args: any[]) => ({ exists: false, data: () => ({}) }),
                set: async (...args: any[]) => ({ success: true }),
                update: async (...args: any[]) => ({ success: true }),
                delete: async (...args: any[]) => ({ success: true }),
            }),
            add: async (...args: any[]) => ({ id: 'mock-admin-id' }),
            get: async (...args: any[]) => ({ docs: [] as any[], empty: true }),
            where: (...args: any[]) => mockCol,
            limit: (...args: any[]) => mockCol,
        };
        return mockCol;
    },
    batch: () => ({
        set: (...args: any[]) => {},
        update: (...args: any[]) => {},
        delete: (...args: any[]) => {},
        commit: async () => {},
    })
};

export const auth = {
    verifyIdToken: async (token: string) => ({ uid: 'sovereign-admin-mock' }),
    getUser: async (uid: string) => ({ uid, displayName: 'Citizen' })
};

export const FieldValue = {
    arrayUnion: (...args: any[]) => args,
    arrayRemove: (...args: any[]) => args,
    serverTimestamp: () => new Date().toISOString(),
    increment: (n: number) => n,
};

