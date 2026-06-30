<script lang="ts">
    import { onMount } from "svelte";
    import { formId } from "../cart";
    import Return from "./Return.svelte";

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

{#if paramCheckoutSessionId !== null && paramFormId === $formId}
    <Return bind:checkoutSessionId={paramCheckoutSessionId} />
{/if}
