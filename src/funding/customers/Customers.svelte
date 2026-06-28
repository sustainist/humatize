<script>
  import { showYourContributions } from ".";
  import Content from "./Content.svelte";
</script>

{#if $showYourContributions}
  <Content />
{:else}
  <div>
    <label>
      <input type="checkbox" bind:checked={$showYourContributions} />
      Your Contributions
    </label>
  </div>
{/if}
