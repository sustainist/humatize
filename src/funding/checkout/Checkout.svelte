<script lang="ts">
  import { onMount } from "svelte";
  import { showFormCheckout } from "..";
  import Request from "./Request.svelte";
  import Return from "./Return.svelte";
  import { formId } from "../cart";

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

{#if $showFormCheckout === $formId}
  <Request />
{/if}

{#if paramCheckoutSessionId !== null && paramFormId === $formId}
  <Return bind:checkoutSessionId={paramCheckoutSessionId} />
{/if}
