<script lang="ts">
    import { getBackers } from ".";
    import { goal, roundNumbersBackers } from "..";
    import { addShares, getShare, type EvaluationExample } from "../../curve";
    import List from "../List.svelte";
    import participants from "./participants.json";
    import Simulation from "./Simulation.svelte";

    const parts = participants as EvaluationExample["participants"];
    // todo: sustainable distribution model for backers
    // todo: display name for backers
    const list: (EvaluationExample | undefined)[] = $derived([
        {
            showOrder: true,
            profit: 1000,
            showSize: true,
            editOrder: false,
            showPledge: true,
            participantName: "Backer",
            showTimeline: true,
            sustainableModel: "backers",
            goal: $goal,
            roundNumbers: $roundNumbersBackers,
            participants: getBackers(parts),
        },
    ]);
    const index = 0;
</script>

{#if list[index]}
    <List items={list[index]} tableId="backers" />
{:else}
    <p style="color:red">
        &lt;List items=&lbrace;{index}&rbrace; /&gt; not found
    </p>
{/if}

<br />

<div class="inline-options" style="width:fit-content">
    <label>
        <input type="checkbox" bind:checked={$roundNumbersBackers} /> Round numbers
    </label>
</div>

<Simulation />
