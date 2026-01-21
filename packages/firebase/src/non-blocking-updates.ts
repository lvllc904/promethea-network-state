
'use client';
    
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  SetOptions,
} from 'firebase/firestore';
import { errorEmitter } from './error-emitter';
import {FirestorePermissionError} from './errors';
import { Citizen } from '@promethea/lib';

/**
 * Initiates a setDoc operation to create a new citizen profile.
 * This is a specific implementation for user creation to ensure the correct data shape.
 * This function IS blocking and should be awaited.
 */
export async function createCitizenProfile(docRef: DocumentReference, data: Citizen) {
  try {
    // The `await` keyword ensures we wait for the operation to complete or fail.
    await setDoc(docRef, data);
  } catch (error) {
    // If it fails, we construct and emit a detailed error.
    const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'create',
        requestResourceData: data,
    });
    errorEmitter.emit('permission-error', permissionError as any);
    // Re-throw the contextual error so the calling function knows the operation failed.
    throw permissionError;
  }
}


/**
 * Initiates a setDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function setDocumentNonBlocking(docRef: DocumentReference, data: any, options: SetOptions) {
  setDoc(docRef, data, options).catch(error => {
    errorEmitter.emit(
      'permission-error',
      `Firestore permission error during write on ${docRef.path}`
    )
  })
  // Execution continues immediately
}


/**
 * Initiates an addDoc operation for a collection reference.
 * Does NOT await the write operation internally.
 * Returns the Promise for the new doc ref, but typically not awaited by caller.
 */
export function addDocumentNonBlocking(colRef: CollectionReference, data: any) {
  const promise = addDoc(colRef, data)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        `Firestore permission error during create on ${colRef.path}`
      )
    });
  return promise;
}


/**
 * Initiates an updateDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function updateDocumentNonBlocking(docRef: DocumentReference, data: any) {
  updateDoc(docRef, data)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        `Firestore permission error during update on ${docRef.path}`
      )
    });
}


/**
 * Initiates a deleteDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function deleteDocumentNonBlocking(docRef: DocumentReference) {
  deleteDoc(docRef)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        `Firestore permission error during delete on ${docRef.path}`
      )
    });
}
