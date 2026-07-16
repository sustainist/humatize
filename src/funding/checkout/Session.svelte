<script lang="ts">
    import { onMount } from "svelte";
    import Return from "./Return.svelte";
    import { slide } from "svelte/transition";

    let paramCheckoutSessionId: string | null = $state(null);

    function getCheckoutReturnData() {
        const params = new URLSearchParams(window.location.search);
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

{#if paramCheckoutSessionId !== null}
    <Return bind:checkoutSessionId={paramCheckoutSessionId} />
{/if}
