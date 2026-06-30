<script lang="ts">
  import { slide } from "svelte/transition";
  import type { LoggerMessage } from ".";

  let {
    logger = $bindable(),
  }: {
    logger: LoggerMessage[];
  } = $props();
</script>

{#each logger as { message: log, type, cb }, i}
  <div class={type} transition:slide>
    <button
      title="close"
      type="button"
      onpointerdown={() => {
        logger.splice(i, 1);
        logger = logger;
        cb?.();
      }}
    >
      <i class="fa-solid fa-xmark"></i>
    </button>
    {log}
  </div>
{/each}

<style>
  button {
    padding: 0.5ch 1ch;
    border: none;
    background: none;
    color: inherit;
    cursor: pointer;
    transition: color 0.2s ease-in-out;
    &:hover {
      color: white;
    }
  }
  .error {
    color: lightcoral;
  }
  .info {
    color: lightgreen;
  }
</style>
