<script lang="ts">
    import { slide } from "svelte/transition";
    import { user } from "../../firebase";
    import SignedIn from "../../account/signedIn/SignedIn.svelte";
    import SignedOut from "../../account/signedOut/SignedOut.svelte";
    import DisplayName from "../../account/signedIn/DisplayName.svelte";
    import AllCustomers from "../../funding/customers/AllCustomers.svelte";
    import List from "../List.svelte";
    import { goal, roundNumbersBackers } from "..";

    let showAccount = $state(false);
</script>

<div class="inline-options" style="width:fit-content">
    <label for="backers-account">
        <input
            id="backers-account"
            type="checkbox"
            bind:checked={showAccount}
        />
        Backer's Account <DisplayName />
    </label>
</div>
{#if showAccount}
    <div transition:slide class="input-group">
        <div>
            {#if $user?.email}
                <SignedIn />

                <AllCustomers>
                    {#snippet customers(items)}
                        <List
                            items={{
                                showOrder: true,
                                showSize: true,
                                editOrder: false,
                                showPledge: true,
                                participantName: "Backer",
                                showTimeline: true,
                                sustainableModel: "backers",
                                goal: $goal,
                                roundNumbers: $roundNumbersBackers,
                                hideParticipants: true,
                                hidePeople: true,
                                participants: items.filter(
                                    (item) => item?.email === $user.email,
                                ),
                            }}
                            tableId="account-pledges"
                        />
                    {/snippet}
                </AllCustomers>
            {:else}
                <SignedOut />
                <div>
                    <small>Sign in to see your pledges and rewards.</small>
                </div>
            {/if}
        </div>
    </div>
{/if}
