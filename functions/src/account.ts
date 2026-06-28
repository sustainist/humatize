import { HttpsError, onCall } from "firebase-functions/v2/https";
import { getAuth } from "firebase-admin/auth";
import { error, info } from "./logger";
import { getStripe } from "./stripe";
import { db, valid } from "./firestore";

export const deleteAccount = onCall(async ({ auth }) => {
  if (!auth) {
    throw new HttpsError(
      "unauthenticated",
      "The function must be called while authenticated.",
    );
  }

  const userId = auth.uid;
  const stripe = getStripe();

  try {
    const deletionPromises: Promise<any>[] = [];

    //  Firestore customers
    const customerDocs = await db
      .collection(valid("customers"))
      .where(valid("email"), "==", auth.token.email)
      .get();

    if (!customerDocs.empty) {
      const stripeCustomersIds: Set<string> = new Set();

      const batchDelete = db.batch();
      customerDocs.forEach((doc) => {
        stripeCustomersIds.add(doc.data().customerId);
        batchDelete.delete(doc.ref);
      });
      deletionPromises.push(batchDelete.commit());

      // Stripe customers
      deletionPromises.push(
        ...Array.from(stripeCustomersIds).map((id) => stripe.customers.del(id)),
      );
    }

    // Firebase Authentication user
    deletionPromises.push(getAuth().deleteUser(userId));

    // Await all the initiated promises
    await Promise.all(deletionPromises);

    info(`Successfully deleted account for user: ${userId}`);

    return { success: true };
  } catch (err) {
    error(`Error deleting account for user ${userId}:`, err);
    throw new HttpsError(
      "unknown",
      err instanceof Error ? err.message : "Unable to delete account",
      { originalError: err },
    );
  }
});
