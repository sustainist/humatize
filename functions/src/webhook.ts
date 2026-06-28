import { onRequest } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import { defineString } from "firebase-functions/params";
import { getStripe } from "./stripe";
import { error, info, warn } from "./logger";
import { db, valid } from "./firestore";

const STRIPE_WEBHOOK_SECRET = defineString("STRIPE_WEBHOOK_SECRET");

export const webhook = onRequest(async (req, res) => {
  const stripe = getStripe();

  try {
    const sig: any = req.headers["stripe-signature"];
    const webhookSecret = STRIPE_WEBHOOK_SECRET.value();

    let event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);

    switch (event.type) {



      case "checkout.session.completed":

        const checkoutSessionCompleted = event.data.object;

        if (checkoutSessionCompleted.payment_status === "paid") {
          const email = checkoutSessionCompleted.customer_details?.email;
          const docId = checkoutSessionCompleted.metadata?.docId;

          if (docId) {
            try {
              const docRef = db.collection(valid("customers")).doc(docId);

              const firestoreData: Partial<Customer> = {
                email,
                timestamp: FieldValue.serverTimestamp(),
                customerId:
                  (typeof checkoutSessionCompleted.customer === "string"
                    ? checkoutSessionCompleted.customer
                    : checkoutSessionCompleted.customer?.id) || null,
                currency: checkoutSessionCompleted.currency || "",
              };

              let metadata: Partial<Customer> = {};
              if (checkoutSessionCompleted.mode === "payment") {
                if (checkoutSessionCompleted.payment_intent) {
                  firestoreData.id =
                    typeof checkoutSessionCompleted.payment_intent === "string"
                      ? checkoutSessionCompleted.payment_intent
                      : checkoutSessionCompleted.payment_intent.id;
                  const paymentIntent = await stripe.paymentIntents.retrieve(
                    firestoreData.id,
                  );
                  firestoreData.interval = "one-time";
                  firestoreData.created = paymentIntent.created;
                  firestoreData.amount = paymentIntent.amount;

                  metadata = paymentIntent.metadata;
                }
              } else if (checkoutSessionCompleted.mode === "subscription") {
                if (checkoutSessionCompleted.subscription) {
                  firestoreData.id =
                    typeof checkoutSessionCompleted.subscription === "string"
                      ? checkoutSessionCompleted.subscription
                      : checkoutSessionCompleted.subscription.id;
                  const subscription = await stripe.subscriptions.retrieve(
                    firestoreData.id,
                  );
                  firestoreData.interval =
                    subscription.items.data[0].price.recurring?.interval;
                  firestoreData.created = subscription.created;
                  firestoreData.amount =
                    subscription.items.data[0].price.unit_amount || 0;

                  metadata = subscription.metadata;
                }
              }

              await docRef.set({ ...firestoreData, ...metadata }, { merge: true });

              info(`Added customer doc ${docRef.id}`);
            } catch (err) {
              error(`Error adding customer doc:`, err);
            }
          } else {
            warn(
              `No docId in session metadata, skipping Firestore write for session ${checkoutSessionCompleted.id}`,
            );
          }

          info(`Payment succeeded for session ${checkoutSessionCompleted.id}`);
        }

        break;



      case "checkout.session.expired":

        const checkoutSessionExpired = event.data.object;

        if (checkoutSessionExpired.customer) {
          try {
            const customer =
              typeof checkoutSessionExpired.customer === "string"
                ? checkoutSessionExpired.customer
                : checkoutSessionExpired.customer.id;

            await stripe.customers.retrieve(customer, { expand: [] });

            const paymentIntents = await stripe.paymentIntents.list({
              customer,
              limit: 1,
            });

            const subscriptions = await stripe.subscriptions.list({
              customer,
              limit: 1,
            });

            if (
              (paymentIntents.data.length === 0 ||
                !paymentIntents.data.some((pi) => pi.status === "succeeded")) &&
              subscriptions.data.length === 0
            ) {
              await stripe.customers.del(customer);

              info(`Customer ${customer} deleted after session expired`);
            } else {
              info(
                `Customer ${customer} has successful payments or subscriptions - not deleting`,
              );
            }
          } catch (err) {
            error(`Error processing customer deletion:`, err);
          }
        }

        break;



      case "customer.subscription.deleted":

        const subscriptionDeleted = event.data.object;
        try {
          await db
            .collection(valid("customers"))
            .where(valid("customerId"), "==", subscriptionDeleted.customer)
            .where(valid("id"), "==", subscriptionDeleted.id)
            .get()
            .then((snapshot) => {
              snapshot.docs.forEach((doc) => {
                doc.ref.update({
                  canceled_at: subscriptionDeleted.canceled_at,
                });
              });
            });

          info(`Subscription with id ${subscriptionDeleted.customer} was deleted`);
        } catch (err) {
          error(`Error updating customer:`, err);
        }

        break;



    }

    res.status(200).send("Webhook processed successfully");
  } catch (err) {
    error(
      `Webhook signature verification failed`,
      err instanceof Error ? ": " + err.message : ".",
    );
    res
      .status(400)
      .send(`Webhook Error${err instanceof Error ? ": " + err.message : "."}`);
  }
});
