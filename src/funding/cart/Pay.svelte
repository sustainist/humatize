<script lang="ts">
  import { showFormCheckout } from "..";
  // import CreditCardIcon from "./credit-card.svg";
  let {
    formId="fund-1",
  }: {
    formId?: string;
  } = $props();
</script>

<button type="submit" class="btn-support btn-primary">
  {#if $showFormCheckout === formId}
    &times;
  {/if}
  <i class="fas fa-arrow-right"></i> 
  <!-- <img src={CreditCardIcon} alt="Credit Card Icon" class="icon" />  -->
  <!-- Checkout -->
  support the event · future invest
</button>
