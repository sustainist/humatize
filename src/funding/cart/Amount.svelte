<script lang="ts">
  let {
    amount = $bindable(),
    formId,
  }: {
    amount: number;
    formId: string;
  } = $props();
</script>

<div>
  <label>
    <input name="{formId}-amount" type="number" bind:value={amount} />
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
