<script lang="ts">
  let {
    interval = $bindable(),
    formId,
  }: {
    interval: "month" | "one-time";
    formId: string;
  } = $props();
</script>

<div class="inline-options">
  {#each [{ value: "month", label: "Monthly" }, { value: "one-time", label: "One-time" }] as { value, label }}
    <label>
      <input
        name="{formId}-interval"
        type="radio"
        {value}
        bind:group={interval}
      /><span>{label}</span>
    </label>
  {/each}
</div>

<style>
  div {
    display: flex;
    gap: 0.25em;
    flex-wrap: wrap;
  }
  label input {
    margin-left: 0;
  }
</style>
