<script lang="ts">
    import { getBackers } from ".";
    import { goal, roundNumbersBackers } from "..";
    import type { EvaluationExample } from "../../curve";
    import List from "../List.svelte";

    let simulateBackers = $state(
        // localStorage.getItem("simulateBackers") === "true",
        false
    );
    /* $effect(() => {
        localStorage.setItem("simulateBackers", "" + simulateBackers);
    }); */

    let simulatedBackers: EvaluationExample["participants"] = $state(
        JSON.parse(localStorage.getItem("simulatedBackers") || "[]"),
    );
    $effect(() => {
        localStorage.setItem(
            "simulatedBackers",
            JSON.stringify(simulatedBackers),
        );
    });

    let simulatedPledge = $state(
        +(localStorage.getItem("simulatedPledge") || 100),
    );
    $effect(() => {
        localStorage.setItem("simulatedPledge", "" + simulatedPledge);
    });

    let simulatedGoal = $state(+(localStorage.getItem("simulatedGoal") || 100));
    $effect(() => {
        localStorage.setItem("simulatedGoal", "" + simulatedGoal);
    });
</script>

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
    <form
        onsubmit={(e) => {
            e.preventDefault();
            simulatedBackers.push({
                pledge: simulatedPledge,
                timestamp: new Date().toISOString(),
            });
        }}
        class="demo-box"
        style="display:flex;flex-direction:column;gap:1rem"
    >
        <div class="input-group">
            <label for="simulated-goal"
                ><i class="fa-solid fa-hand-holding-heart"></i> Simulate Goal</label
            >
            <input
                bind:value={simulatedGoal}
                type="number"
                id="simulated-goal"
                min="1"
            />
        </div>

        <div class="input-group">
            <label for="simulated-pledge"
                ><i class="fa-solid fa-hand-holding-heart"></i> Simulate Pledge Amount</label
            >
            <input
                bind:value={simulatedPledge}
                type="number"
                id="simulated-pledge"
                min="1"
            />
        </div>

        <div
            class="input-group full-width"
            style="flex-direction: row; flex-wrap: wrap; gap: 1rem; align-items: center; margin-top: 0.5rem;"
        >
            <button type="submit" class="btn-primary"
                ><i class="fas fa-rocket"></i> Add Pledge</button
            >
            {#if simulatedBackers.length}
                <button
                    type="button"
                    class="btn-primary"
                    onpointerdown={() => {
                        simulatedBackers = [];
                    }}
                >
                    <i class="fas fa-trash"></i> Clear Pledges
                </button>
            {/if}
        </div>
    </form>
    {#if simulatedBackers.length > 0}
        <List
            items={{
                showOrder: true,
                profit: 1000,
                showSize: true,
                editOrder: false,
                showPledge: true,
                participantName: "Backer",
                showTimeline: true,
                sustainableModel: "backers",
                participants: getBackers(simulatedBackers),
                roundNumbers: $roundNumbersBackers,
                goal: simulatedGoal,
            }}
            tableId="simulation-backers"
        />
    {/if}
{/if}
