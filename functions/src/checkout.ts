import { HttpsError, onCall } from "firebase-functions/v2/https";
import { error, info } from "./logger";
import { type Stripe } from "stripe";
import { getStripe } from "./stripe";
import { db, valid } from "./firestore";
import { defineString } from "firebase-functions/params";

const PRODUCT_ID = defineString("STRIPE_PRODUCT_ID");

async function getOrCreateCustomer(
  email: string,
  currency: string,
  stripe: Stripe,
): Promise<string> {
  let customerId: string;

  const customerDocs = email
    ? (
      await db
        .collection(valid("customers"))
        .where(valid("currency"), "==", currency)
        .where(valid("email"), "==", email)
        .limit(1)
        .get()
    ).docs
    : [];
  if (customerDocs.length) {
    const data = customerDocs[0].data();
    customerId = data.customerId;
  } else {
    const customer = await stripe.customers.create({
      email,
      metadata: {
        currency,
      },
    });
    customerId = customer.id;
  }

  return customerId;
}

async function getPriceId(
  currentProductId: string,
  amount: number,
  currency: string,
  interval: Checkout["interval"],
  stripe: Stripe,
): Promise<string> {
  let priceId: string;

  const priceDocsSnapshot = await db
    .collection(valid("products"))
    .doc(currentProductId)
    .collection(valid("prices"))
    .where(valid("amount"), "==", amount)
    .where(valid("currency"), "==", currency)
    .where(valid("interval"), "==", interval)
    .where(valid("active"), "==", true)
    .limit(1)
    .get();

  const priceDocs = priceDocsSnapshot.docs;

  if (priceDocs.length) {
    priceId = priceDocs[0].id;
    info(`Using existing price ${priceId}`);
  } else {
    info(`Creating new price for ${amount} ${currency} ${interval}`);

    const price = await stripe.prices.create(
      {
        product: currentProductId,
        currency,
        unit_amount: amount * 100,
        recurring:
          interval && interval !== "one-time"
            ? {
              interval,
            }
            : undefined,
      }
    );

    priceId = price.id;

    await db
      .collection(valid("products"))
      .doc(currentProductId)
      .collection(valid("prices"))
      .doc(priceId)
      .set({ amount, currency, interval, active: true });
  }

  return priceId;
}

// create checkout session

export const createCheckoutSession = onCall(async ({ data, auth }) => {
  const {
    domain,
    amount,
    currency,
    interval,
    purpose,
    email = auth?.token.email!,
  } = data as Checkout;

  info(`Creating checkout session for ${email}`);

  const stripe = getStripe();

  try {
    const currentProductId = PRODUCT_ID.value();
    const priceId = await getPriceId(
      currentProductId,
      amount,
      currency,
      interval,
      stripe,
    );
    const customerId = await getOrCreateCustomer(email, currency, stripe);

    const url = new URL(domain);
    url.hash = "";
    url.searchParams.delete("checkout_session_id");

    const metadataCustomer: { [_: string]: string } =
    {
      purpose: purpose,
    };

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded_page',
      mode: interval === "one-time" ? "payment" : "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer: customerId,
      metadata: {
        email: email || null,
        docId: db.collection(valid("customers")).doc().id,
      },
      ...(interval === "one-time"
        ? {
          payment_intent_data: {
            metadata: metadataCustomer,
          },
        }
        : {
          subscription_data: {
            metadata: metadataCustomer,
          },
        }),
      return_url: url.href +
        (url.searchParams.size ? `&` : "?") +
        "checkout_session_id={CHECKOUT_SESSION_ID}",
    });

    info(`Created checkout session ${session.id}`);

    return { client_secret: session.client_secret };
  } catch (err) {
    error("Error creating checkout session:", err);

    if (err instanceof HttpsError) throw err;

    if (typeof err === "object" && err !== null && "code" in err) {
      const firebaseError = err as { code: string };

      if (firebaseError.code === "permission-denied") {
        throw new HttpsError(
          "permission-denied",
          "You do not have permission to create this session.",
        );
      }
      if (firebaseError.code === "not-found") {
        throw new HttpsError("not-found", "Product or price not found.");
      }
    }

    if (typeof err === "object" && err !== null && "type" in err) {
      const stripeError = err as { type: string; message: string };

      if (stripeError.type === "StripeInvalidRequestError") {
        throw new HttpsError(
          "invalid-argument",
          `Invalid request: ${stripeError.message}`,
        );
      }
      if (stripeError.type === "StripeRateLimitError") {
        throw new HttpsError(
          "resource-exhausted",
          "Stripe is busy. Please try again in a moment.",
        );
      }
    }

    throw new HttpsError(
      "internal",
      "Unable to create checkout session. Please try again or contact support.",
    );
  }
});

// retrieve session status

export const sessionStatus = onCall(async ({ data, auth }) => {
  const stripe = getStripe();

  try {
    const { checkoutSessionId, email = auth?.token.email } = data as {
      checkoutSessionId: string;
      email?: string;
    };

    const session = await stripe.checkout.sessions.retrieve(checkoutSessionId);

    if (email && session.customer_details?.email !== email) {
      throw new HttpsError(
        "permission-denied",
        "Email does not match this checkout session.",
      );
    }

    return {
      status: session.status,
    };
  } catch (err) {
    error("Error retrieving session status:", err);
    throw new HttpsError(
      "unknown",
      err instanceof Error ? err.message : "Unable to retrieve session status",
    );
  }
});
