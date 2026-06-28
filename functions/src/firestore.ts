import { getFirestore } from "firebase-admin/firestore";

export const db = getFirestore();

export function valid(
  key: keyof Customer | "customers" | "products" | "prices" | "active",
) {
  return key;
}

export function isNotFoundError(err: unknown): boolean {
  if (typeof err === "object" && err !== null && "code" in err) {
    const firebaseError = err as { code: string | number; message: string };
    return firebaseError.code === "not-found" || firebaseError.code === 5;
  }
  return false;
}
