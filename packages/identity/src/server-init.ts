export const getServerFirebase = async () => {
  return {
    firestore: () => ({
      collection: (name?: string) => ({
        doc: (id?: string) => ({
          get: async () => ({ exists: false, data: () => ({}) }),
          set: async () => {},
          update: async () => {},
        }),
        add: async () => ({ id: 'mock-server-id' }),
        where: () => ({
            get: async () => ({ empty: true, docs: [] })
        }),
        orderBy: () => ({
            get: async () => ({ empty: true, docs: [] })
        }),
        limit: () => ({
            get: async () => ({ empty: true, docs: [] })
        }),
        get: async () => ({ docs: [], empty: true })
      }),
      batch: () => ({
        set: () => {},
        update: () => {},
        delete: () => {},
        commit: async () => {},
      })
    }),
    auth: () => ({
      verifyIdToken: async () => ({ uid: 'server-mock-uid' })
    })
  };
};
