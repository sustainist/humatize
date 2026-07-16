<script lang="ts">
  import { formId } from ".";
  import { showFormCheckout } from "..";
  // import CreditCardIcon from "./credit-card.svg";
</script>

<button
  type="button"
  class="btn-support btn-primary"
  onpointerdown={() => {
    $showFormCheckout = $showFormCheckout !== $formId ? $formId : null;
  }}
>
  {#if $showFormCheckout === $formId}
    <i class="fas fa-times"></i>
  {:else}
    <i class="fas fa-arrow-right"></i>
  {/if}
  <!-- <img src={CreditCardIcon} alt="Credit Card Icon" class="icon" />  -->
  <!-- Checkout -->
  Checkout
</button>
