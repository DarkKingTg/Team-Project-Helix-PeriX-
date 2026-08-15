import {
  collection,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  WhereFilterOp,
  DocumentData,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Save or overwrite a document by ID in a Firestore collection
 */
export async function saveDocument<T extends DocumentData>(
  collectionName: string,
  docId: string,
  data: T
): Promise<void> {
  try {
    const cleanId = String(docId).replace(/\//g, "_");
    const docRef = doc(db, collectionName, cleanId);
    await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
  } catch (err) {
    console.warn(`[Firestore] Failed to save document in ${collectionName}/${docId}:`, err);
  }
}

/**
 * Add a new document with an auto-generated ID
 */
export async function addDocument<T extends DocumentData>(
  collectionName: string,
  data: T
): Promise<string | null> {
  try {
    const colRef = collection(db, collectionName);
    const docRef = await addDoc(colRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    console.warn(`[Firestore] Failed to add document to ${collectionName}:`, err);
    return null;
  }
}

/**
 * Update an existing document
 */
export async function updateDocument(
  collectionName: string,
  docId: string,
  data: Partial<DocumentData>
): Promise<void> {
  try {
    const cleanId = String(docId).replace(/\//g, "_");
    const docRef = doc(db, collectionName, cleanId);
    await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
  } catch (err) {
    console.warn(`[Firestore] Failed to update document in ${collectionName}/${docId}:`, err);
  }
}

/**
 * Delete a document by ID
 */
export async function deleteDocument(
  collectionName: string,
  docId: string
): Promise<void> {
  try {
    const cleanId = String(docId).replace(/\//g, "_");
    const docRef = doc(db, collectionName, cleanId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn(`[Firestore] Failed to delete document in ${collectionName}/${docId}:`, err);
  }
}

/**
 * Real-time subscription to a collection or filtered query
 */
export function subscribeCollection<T>(
  collectionName: string,
  callback: (items: T[]) => void,
  filter?: { field: string; op: WhereFilterOp; value: unknown }
): () => void {
  try {
    const constraints: QueryConstraint[] = [];
    if (filter && filter.value !== undefined && filter.value !== null) {
      constraints.push(where(filter.field, filter.op, filter.value));
    }

    const q = query(collection(db, collectionName), ...constraints);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: T[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as unknown as T[];
        callback(items);
      },
      (err) => {
        console.warn(`[Firestore] Listener error on ${collectionName}:`, err);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn(`[Firestore] Failed to subscribe to ${collectionName}:`, err);
    return () => {};
  }
}

/**
 * One-time fetch of documents from a collection
 */
export async function fetchCollection<T>(
  collectionName: string,
  filter?: { field: string; op: WhereFilterOp; value: unknown }
): Promise<T[]> {
  try {
    const constraints: QueryConstraint[] = [];
    if (filter && filter.value !== undefined && filter.value !== null) {
      constraints.push(where(filter.field, filter.op, filter.value));
    }
    const q = query(collection(db, collectionName), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as unknown as T[];
  } catch (err) {
    console.warn(`[Firestore] Failed to fetch collection ${collectionName}:`, err);
    return [];
  }
}
