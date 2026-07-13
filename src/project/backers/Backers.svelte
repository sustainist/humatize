<script lang="ts">
    import { goal } from "..";
    import type { EvaluationExample } from "../../curve";
    import List from "../List.svelte";
    import participants from "./participants.json";

    const parts = participants as EvaluationExample["participants"];

    const list: (EvaluationExample | undefined)[] = [
        {
            showOrder: true,
            profit: 1000,
            showSize: true,
            editOrder: false,
            showPledge: true,
            participantName: "Backer",
            showTimeline: true,
            participants: parts.map((participant, i) => {
                if (i === 0 && participant) participant.pledge = "" + $goal;
                return participant;
            }),
        },
    ];
    const index = 0;

    let simulateBackers = $state(false);
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
    <label
        ><input
            bind:checked={simulateBackers}
            type="checkbox"
            name="simulate-backers"
        /> Simulate Backers Rewards</label
    >
</div>

<br />

{#if simulateBackers}
    <div class="demo-box">
        

    </div>
{/if}
