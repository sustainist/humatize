<script lang="ts">
    import { goal, initMRP, mrp, roundNumbersBackers } from "..";
    import AllCustomers from "../../funding/customers/AllCustomers.svelte";
    import List from "../List.svelte";
    import Account from "./Account.svelte";
    import Simulation from "./Simulation.svelte";
</script>

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
                hidePeople: true,
                goal: $goal,
                roundNumbers: $roundNumbersBackers,
                hideParticipants: true,
                participants: items,
            }}
            tableId="backers"
        />
    {/snippet}
</AllCustomers>

<br />

<div class="inline-options" style="width:fit-content">
    <label>
        <input type="checkbox" bind:checked={$roundNumbersBackers} /> Round numbers
    </label>
</div>

<Simulation />

<Account />
