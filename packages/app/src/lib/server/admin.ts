// Sovereign Admin Substrate (Phase C Decommission)
export const db = {
    collection: (name: string) => ({
        doc: (id: string) => ({
            get: async () => ({ exists: false, data: () => ({}) }),
            set: async () => ({ success: true }),
            update: async () => ({ success: true }),
            delete: async () => ({ success: true }),
        }),
        add: async () => ({ id: 'mock-admin-id' }),
        get: async () => ({ docs: [] })
    }),
    batch: () => ({
        set: () => {},
        update: () => {},
        delete: () => {},
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

