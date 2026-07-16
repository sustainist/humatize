<script lang="ts">
    import { customersToBackers, getBackers } from ".";
    import { goal, initMRP, mrp, roundNumbersBackers } from "..";
    import AllCustomers from "../../funding/customers/AllCustomers.svelte";
    import List from "../List.svelte";
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
                goal: $goal,
                roundNumbers: $roundNumbersBackers,
                hideParticipants: true,
                participants: getBackers(customersToBackers(items), {
                    mrp: $mrp,
                    nrOfPeople: 1,
                    timestamp: initMRP.timestamp,
                }),
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
