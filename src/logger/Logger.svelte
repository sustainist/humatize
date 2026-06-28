<script lang="ts">
  import { slide } from "svelte/transition";
  import type { LoggerMessage } from ".";

  let {
    logger = $bindable(),
  }: {
    logger: LoggerMessage[];
  } = $props();
</script>

{#each logger as {message: log, type, cb}, i}
  <div class={type} transition:slide>
    <button
      type="button"
      onpointerdown={() => {
        logger.splice(i, 1);
        logger = logger;
        cb?.();
      }}>&times;</button
    >
    {log}
  </div>
{/each}

<style>
  button {
    padding: 0.5ch 1ch;
    font-size: xx-small;
    vertical-align: middle;
  }
  .error {
    color: red;
  }
  .info {
    color: green;
  }
</style>
