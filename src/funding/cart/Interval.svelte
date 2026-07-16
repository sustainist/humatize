<script lang="ts">
  import { formId, interval } from ".";
</script>

<div class="inline-options">
  {#each [{ value: "month", label: "Monthly" }, { value: "one-time", label: "One-time" }] as { value, label }}
    <label>
      <input
        name="{$formId}-interval"
        type="radio"
        {value}
        bind:group={$interval}
      /><span>{label}</span>
    </label>
  {/each}
</div>
