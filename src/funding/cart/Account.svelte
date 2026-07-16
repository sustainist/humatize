<script lang="ts">
    import { logger, user } from "../../firebase";
    import DisplayName from "../../account/signedIn/DisplayName.svelte";
    import Email from "./Email.svelte";
    import SignedOut from "../../account/signedOut/SignedOut.svelte";
    import Logger from "../../logger/Logger.svelte";
    import SignedIn from "../../account/signedIn/SignedIn.svelte";

    let emailSource: "email" | "account" = $state("email");
</script>

<div class="inline-options" style:margin="0.5em 0">
    <label>
        <input
            type="radio"
            name="email-source"
            value="email"
            bind:group={emailSource}
        />
        Email
    </label>
    <label>
        <input
            type="radio"
            name="email-source"
            value="account"
            bind:group={emailSource}
        />
        {#if $user?.email}
            Account <DisplayName />
        {:else}
            Sign in
        {/if}
    </label>
</div>
<div>
    {#if emailSource === "email"}
        <Email />
    {:else if emailSource === "account"}
        <div style:margin="0.25em 0">
            <Logger bind:logger={$logger} />
        </div>
        {#if $user?.email}
            <SignedIn />
            <br />
            <br />
        {:else}
            <SignedOut />
        {/if}
    {/if}
</div>
