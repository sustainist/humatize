import { HttpsError } from "firebase-functions/v2/https";
import { defineString } from "firebase-functions/params";
import stripe from "stripe";
import { error } from "./logger";

const STRIPE_SECRET_KEY = defineString("STRIPE_SECRET_KEY");

let stripeInstance: stripe.Stripe | null = null;

export const getStripe = (): stripe.Stripe => {
  if (!stripeInstance) {
    try {
      const key = STRIPE_SECRET_KEY.value();
      stripeInstance = stripe(key);
    } catch (err) {
      error("Error initializing Stripe:", err);
      throw new HttpsError(
        "unknown",
        err instanceof Error ? err.message : "Unable to initialize Stripe",
      );
    }
  }
  return stripeInstance;
};
