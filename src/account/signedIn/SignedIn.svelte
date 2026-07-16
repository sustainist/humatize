<script>
  import SignOut from "./SignOut.svelte";
  import DeleteAccount from "./DeleteAccount.svelte";
  import Name from "./Name.svelte";
  import Email from "./Email.svelte";
</script>

<div class="signed-in">
  <SignOut />
  <Email />
  <Name />
  <DeleteAccount />
</div>

<style>
  :global .signed-in {
    display: flex;
    flex-direction: column;
    gap: 1em;

    h5 {
      font-size: 0.9em;
    }
  }
</style>
