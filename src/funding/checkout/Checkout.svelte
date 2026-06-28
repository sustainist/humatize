<script lang="ts">
  import { onMount } from "svelte";
  import { showFormCheckout } from "..";
  import Request from "./Request.svelte";
  import Return from "./Return.svelte";

  const {
    formId,
    amount,
    currency,
    interval,
    email,
    purpose,
  }: {
    formId: string;
    amount: number;
    currency: { code: string; symbol: string } | null;
    interval: "month" | "one-time";
    email: string;
    purpose: string;
  } = $props();

  // checkout return
  let paramFormId: string | null = $state(null);
  let paramCheckoutSessionId: string | null = $state(null);

  function getCheckoutReturnData() {
    const params = new URLSearchParams(window.location.search);
    paramFormId = params.get("form_id");
    paramCheckoutSessionId = params.get("checkout_session_id");
  }

  onMount(() => {
    getCheckoutReturnData();
    window.addEventListener("popstate", getCheckoutReturnData);
    return () => {
      window.removeEventListener("popstate", getCheckoutReturnData);
    };
  });
</script>

{#if $showFormCheckout === formId}
  <Request {formId} {amount} {currency} {interval} {email} {purpose} />
{/if}

{#if paramCheckoutSessionId !== null && paramFormId === formId}
  <Return bind:checkoutSessionId={paramCheckoutSessionId} {formId} />
{/if}
