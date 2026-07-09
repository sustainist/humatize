<script lang="ts">
  import { currencies, jsonParse, showFormCheckout } from ".";
  import { user } from "../firebase";
  import Cart from "./cart/Cart.svelte";
  import Customers from "./customers/AccountCustomers.svelte";
  import Checkout from "./checkout/Checkout.svelte";
  import { onMount } from "svelte";
  import { destination, formId, makeId } from "./cart";

  onMount(() => {
    $formId = "form-" + makeId();
    if (!$destination) {
      $destination = document.title;
    }
  });
</script>

<Cart />

<!-- <Checkout {formId} {interval} {currency} {amount} {email} {destination} /> -->

<!-- <Customers /> -->

<style>
  :global .funding > * {
    margin: 0.25em 0;
  }
</style>
