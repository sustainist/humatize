<script lang="ts">
  import { amount, formId } from ".";
</script>

<div>
  <span>€</span>
  <label>
    <input name="{$formId}-amount" type="number" bind:value={$amount} />
  </label>
</div>

<style>
  div {
    margin-top: 0.5em;
    gap: 0.5em;
    display: flex;
    align-items: center;
  }
  label {
    flex: 1;
  }
  input {
    width: 10ch;
  }
</style>
