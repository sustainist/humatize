<script lang="ts">
  import { amount, formId } from ".";
</script>

<div>
  <label>
    <input name="{$formId}-amount" type="number" bind:value={$amount} />
  </label>
</div>

<style>
  div {
    margin-top: 0.5em;
  }
  input {
    width: 10ch;
  }
</style>
