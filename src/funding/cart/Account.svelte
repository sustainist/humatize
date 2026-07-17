<script lang="ts">
    import { logger, user } from "../../firebase";
    import DisplayName from "../../account/signedIn/DisplayName.svelte";
    import Email from "./Email.svelte";
    import SignedOut from "../../account/signedOut/SignedOut.svelte";
    import Logger from "../../logger/Logger.svelte";
    import SignedIn from "../../account/signedIn/SignedIn.svelte";
    import { slide } from "svelte/transition";

    let emailSource: "email" | "account" = $state("email");
</script>

<div class="inline-options">
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
        <div style="margin-top:1em">
            <Email />
        </div>
    {:else if emailSource === "account"}
        <div>
            <Logger bind:logger={$logger} />
        </div>
        {#if $user?.email}
            <div>
                <SignedIn />
            </div>
        {:else}
            <div>
                <SignedOut />
            </div>
        {/if}
    {/if}
</div>
