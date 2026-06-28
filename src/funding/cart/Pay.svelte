<script lang="ts">
  import { showFormCheckout } from "..";
  import CreditCardIcon from "./credit-card.svg";
  let {
    formId,
  }: {
    formId: string;
  } = $props();
</script>

<button type="submit">
  {#if $showFormCheckout === formId}
    &times;
  {/if}
  <img src={CreditCardIcon} alt="Credit Card Icon" class="icon" /> 
  Checkout
</button>
