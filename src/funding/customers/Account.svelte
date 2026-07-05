<script lang="ts">
    import DisplayName from "../../account/signedIn/DisplayName.svelte";
    import SignedIn from "../../account/signedIn/SignedIn.svelte";
    import SignedOut from "../../account/signedOut/SignedOut.svelte";
    import { user } from "../../firebase";

    let showAccount = $state(false);
</script>

<h5>
    Account <DisplayName />
    <span
        class="inline-options"
        style="display:inline-flex;margin-bottom:1rem;"
    >
        <label
            ><input
                name="show account"
                type="checkbox"
                bind:checked={showAccount}
            /> Settings</label
        >
    </span>
</h5>

{#if showAccount}
    <div class="input-group">
        {#if $user?.email}
            <SignedIn />
        {:else}
            <SignedOut />
        {/if}
    </div>
{/if}
