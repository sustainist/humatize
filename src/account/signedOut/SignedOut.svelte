<script>
  import SignIn from "./SignIn.svelte";
  import SignInWithGoogle from "./SignInWithGoogle.svelte";
  import SignInWithLink from "./SignInWithLink.svelte";
  import SignInWithEmailAndPassword from "./SignInWithEmailAndPassword.svelte";
  import { signInWith } from "../../firebase";
</script>

<div class="signed-out">
  <SignIn />
  {#if $signInWith === "google"}
    <SignInWithGoogle />
  {:else if $signInWith === "link"}
    <SignInWithLink />
  {:else if $signInWith === "email"}
    <SignInWithEmailAndPassword />
  {/if}
</div>

<style>
  :global .signed-out form div {
    margin-top: 0.25em;
    margin-bottom: 0.25em;
  }
</style>
