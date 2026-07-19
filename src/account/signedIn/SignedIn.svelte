<script>
  import SignOut from "./SignOut.svelte";
  import DeleteAccount from "./DeleteAccount.svelte";
  import Name from "./Name.svelte";
  import Email from "./Email.svelte";
  import { slide } from "svelte/transition";
  import ShowSettings from "./ShowSettings.svelte";

  let showAccountSettings = $state(false);
</script>

<div class="signed-in" style="margin-top:0.5em">
  <div style="align-items:center;gap:1em">
    <SignOut />
    <ShowSettings bind:showAccountSettings />
  </div>
  {#if showAccountSettings}
    <div
      transition:slide
      style="flex-direction:column;border-bottom:2px dotted #1f5a4b;padding-bottom:1.5em;margin-bottom:1.5em"
    >
      <Email />
      <Name />
      <DeleteAccount />
    </div>
  {/if}
</div>

<style>
  div div {
    display: flex;
  }
  :global .signed-in {
    h5 {
      margin-top: 1.5em;
      margin-bottom: 0;
      font-size: 1em;
    }
  }
</style>
