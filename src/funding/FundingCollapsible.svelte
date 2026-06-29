<script lang="ts">
  import { currencies, jsonParse, makeId, showFormCheckout } from ".";
  import { user } from "../firebase";
  import Cart from "./cart/Cart.svelte";
  import Customers from "./customers/Customers.svelte";
  import Checkout from "./checkout/Checkout.svelte";

  const formId = "funding-" + makeId();

  // open
  let open = $state(localStorage.getItem("funding open") === "true");
  $effect(() => {
    localStorage.setItem("funding open", open.toString());
  });

  // email
  let email = $derived($user?.email || localStorage.getItem(`email`) || "");
  $effect(() => {
    localStorage.setItem(`email`, email);
    $showFormCheckout = null;
  });

  // purpose
  let purpose = $derived(
    localStorage.getItem(`selected purpose for ${formId}`) ||
      document.querySelector("header h1")?.textContent ||
      "",
  );
  $effect(() => {
    localStorage.setItem(`selected purpose for ${formId}`, purpose);
    $showFormCheckout = null;
  });

  // currency
  let currency: { code: string; symbol: string } = $derived(
    jsonParse(
      localStorage.getItem(`selected currency for ${formId}`),
      null,
    )[1] || {
      code: $currencies[0]?.code || "eur",
      symbol: $currencies[0]?.symbol || "€",
    },
  );
  $effect(() => {
    localStorage.setItem(
      `selected currency for ${formId}`,
      JSON.stringify(currency),
    );
    $showFormCheckout = null;
  });

  // amount
  let amount: number = $derived(
    +(localStorage.getItem(`selected amount for ${formId}`) || "null") || 8,
  );
  $effect(() => {
    localStorage.setItem(`selected amount for ${formId}`, "" + amount);
    $showFormCheckout = null;
  });

  // recurring
  let interval: "month" | "one-time" = $derived(
    (<["month", "one-time"]>["month", "one-time"]).find(
      (i) => i === localStorage.getItem(`selected interval for ${formId}`),
    ) || "month",
  );
  $effect(() => {
    localStorage.setItem(`selected interval for ${formId}`, interval);
    $showFormCheckout = null;
  });
</script>

<details bind:open id={formId} class="funding">
  <summary>Crowdfunding</summary>
  <Cart
    {formId}
    bind:amount
    bind:currency
    bind:interval
    bind:email
    bind:purpose
  />

  <Checkout {formId} {interval} {currency} {amount} {email} {purpose} />

  <Customers />
</details>

<style>
  :global .funding > * {
    margin: 0.25em 0;
  }
</style>
