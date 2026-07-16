<script lang="ts">
  import { currencies, jsonParse, showFormCheckout } from ".";
  import { user } from "../firebase";
  import Cart from "./cart/Cart.svelte";
  import Customers from "./customers/AccountCustomers.svelte";
  import Checkout from "./checkout/Checkout.svelte";
  import { onMount } from "svelte";
  import { project, formId, makeId } from "./cart";
  import Pay from "./cart/Pay.svelte";

  onMount(() => {
    $formId = "form-" + makeId();
    if (!$project) {
      $project = document.title;
    }
  });
</script>

<Cart />

<Pay />

<Checkout />

<style>
  :global .funding > * {
    margin: 0.25em 0;
  }
</style>
