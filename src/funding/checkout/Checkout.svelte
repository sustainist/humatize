<script lang="ts">
  import { showFormCheckout } from "..";
  import Request from "./Request.svelte";
  import { formId } from "../cart";
</script>

{#if $showFormCheckout === $formId}
  <Request />
{/if}
