export interface FirestorePermissionErrorDetails {
  path: string;
  operation: 'create' | 'read' | 'update' | 'delete';
  requestResourceData?: any;
}

export class FirestorePermissionError extends Error {
  public details: FirestorePermissionErrorDetails;

  constructor(details: FirestorePermissionErrorDetails | string) {
    if (typeof details === 'string') {
      super(details);
      this.details = { path: 'unknown', operation: 'read', requestResourceData: null };
    } else {
      super(`Firestore permission error during ${details.operation} on ${details.path}`);
      this.details = details;
    }
    this.name = 'FirestorePermissionError';
  }
}
