<script lang="ts">
  import { onMount } from "svelte";
  import { httpsCallable } from "firebase/functions";
  import { loadStripe, type StripeEmbeddedCheckout } from "@stripe/stripe-js";
  import { functions } from "../../firebase";
  import { showFormCheckout } from "..";
  import { slide } from "svelte/transition";
  import type { LoggerMessage } from "../../logger";
  import Logger from "../../logger/Logger.svelte";
  import { amount, currency, email, formId, interval, destination } from "../cart";

  onMount(() => {
    document
      .getElementById("checkout")
      ?.closest(".container-funding")
      ?.scrollIntoView({ behavior: "smooth" });

    let instance: StripeEmbeddedCheckout | null = null;

    loadStripe(import.meta.env.VITE_stripe_pk)
      .then((stripe) => {
        if (!stripe) {
          logger = [
            { message: "Stripe not initialized", type: "error" },
            ...logger,
          ];
          return;
        }

        const url = new URL(location.href);
        url.searchParams.delete("form_id");
        url.searchParams.append("form_id", "" + $formId);

        const cartCheckout: Checkout = {
          amount: $amount,
          currency: $currency?.code || "eur",
          domain: url.href,
          email: $email,
          purpose: $destination,
          interval: $interval,
        };

        return (
          functions &&
          httpsCallable(
            functions,
            "createCheckoutSession",
          )(cartCheckout)
            .then(({ data }) => {
              const { client_secret: clientSecret } = data as {
                client_secret: string;
              };
              if (!clientSecret) throw new Error("Missing client secret");
              return stripe.createEmbeddedCheckoutPage({
                clientSecret,
              });
            })
            .then((checkout) => {
              instance = checkout;
              instance.mount("#checkout");
            })
        );
      })
      .catch((error) => {
        logger = [
          {
            message: error.message,
            type: "error",
            cb: () => ($showFormCheckout = null),
          },
          ...logger,
        ];
      });

    return () => {
      instance?.destroy();
    };
  });

  let logger: LoggerMessage[] = $state([]);
</script>

<div id="checkout" transition:slide><Logger bind:logger /></div>

<style>
  #checkout {
    width: 100%;
    overflow: auto;
    background-color: #fff;
    position: relative;

    &:empty {
      background: linear-gradient(90deg, #fff 25%, whitesmoke 50%, #fff 75%);
      background-size: 200% 100%;
      animation: shimmer 3s infinite;
      padding: 1rem 0;
    }
  }

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
</style>
