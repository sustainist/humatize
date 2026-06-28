<script lang="ts">
  import type { Component } from "svelte";
  import Loading from "./Loading.svelte";

  const {
    p,
    loadingText,
    ...props
  }: {
    p: ImportPath;
    loadingText?: string;
  } & Record<string, any> = $props();

  type ImportPath = "./funding/Funding.svelte";

  const i: Map<ImportPath, Promise<{ default: Component<any> }>> = new Map();

  i.set("./funding/Funding.svelte", import("./funding/Funding.svelte"));
</script>

{#if i.has(p)}
  {#await i.get(p)!}
    <Loading text={loadingText} />
  {:then Module}
    {#if typeof props.children === "function"}
      {@const { children, ...rest } = props}
      <Module.default {...rest}>
        {@render children()}
      </Module.default>
    {:else}
      <Module.default {...props} />
    {/if}
  {:catch error}
    <small style:color="red">{error.message}</small>
  {/await}
{:else}
  <code style:color="red"
    ><b>{p}</b> not found in ./DynamicComponent.svelte</code
  >
{/if}
