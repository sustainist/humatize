// Get currency codes

import { HttpsError, onCall } from "firebase-functions/v2/https";
import { error, info } from "./logger";
import { getStripe } from "./stripe";

// Get currency codes

/* export const getCurrencyCodes = onCall(async () => {
  const stripe = getStripe();

  try {
    const account = await stripe.accounts.retrieve();
    const accountCountry = account.country;

    if (!accountCountry) {
      throw new HttpsError(
        "failed-precondition",
        "Stripe account country not configured. Please set up your Stripe account.",
      );
    }

    const countrySpecs = await stripe.countrySpecs.retrieve(accountCountry);
    const currencyCodes = countrySpecs.supported_payment_currencies;

    return { currencyCodes };
  } catch (err) {
    error("Error getting currencies:", err);

    if (err instanceof HttpsError) throw err;

    if (typeof err === "object" && err !== null && "type" in err) {
      const stripeError = err as { type: string; message: string };

      if (stripeError.type === "StripeInvalidRequestError") {
        throw new HttpsError("invalid-argument", stripeError.message);
      }
      if (stripeError.type === "StripeAuthenticationError") {
        throw new HttpsError("internal", "Stripe authentication failed");
      }
      if (stripeError.type === "StripeRateLimitError") {
        throw new HttpsError(
          "resource-exhausted",
          "Too many requests. Please try again later.",
        );
      }
    }

    throw new HttpsError(
      "internal",
      "Unable to retrieve currency codes. Please contact support.",
    );
  }
}); */

// Cancel subscription

export const cancelSubscription = onCall(async ({ data, auth }) => {
  if (!auth) {
    throw new HttpsError(
      "unauthenticated",
      "The function must be called while authenticated.",
    );
  }

  const stripe = getStripe();

  try {
    const { id } = data as { id: string };

    const subscription = await stripe.subscriptions.cancel(id);

    info(`Canceled subscription ${id}`);

    const customer: {
      id: string;
      canceled_at: number | null;
    } = {
      id: subscription.id,
      canceled_at: subscription.canceled_at,
    }

    return customer;
  } catch (err) {

    error("Error canceling subscription:", err);
    throw new HttpsError(
      "unknown",
      err instanceof Error ? err.message : "Unable to cancel subscription",
    );
  }
});
