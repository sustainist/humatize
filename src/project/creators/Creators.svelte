<script lang="ts">
    import { goal, roundNumbersCreators } from "..";
    import { type Distribution } from "../../sustainableDistribution";
    import List from "../List.svelte";
    import participants from "./participants.json";
    import Simulation from "./Simulation.svelte";

    const list: (Distribution | undefined)[] = $derived([
        {
            showOrder: true,
            showSize: true,
            editOrder: false,
            showCompensation: true,
            sustainableModel: "creators",
            participantName: "Creator",
            participants,
            goal: $goal,
            roundNumbers: $roundNumbersCreators,
        },
    ]);
    const index = 0;
</script>

{#if list[index]}
    <List items={list[index]} tableId="creators" />
{:else}
    <p style="color:red">
        &lt;List items=&lbrace;{index}&rbrace; /&gt; not found
    </p>
{/if}

<br />

<div class="inline-options" style="width:fit-content">
    <label>
        <input type="checkbox" bind:checked={$roundNumbersCreators} /> Round numbers
    </label>
</div>

<Simulation />
