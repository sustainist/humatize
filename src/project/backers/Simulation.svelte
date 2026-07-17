<script lang="ts">
    import { getBackers } from ".";
    import {
        initMRP,
        mrp,
        roundNumbersBackers,
        simulateGoal,
        simulateMRP,
    } from "..";
    import type { Distribution } from "../../sustainableDistribution";
    import List from "../List.svelte";

    let simulateBackers = $state(
        // localStorage.getItem("simulateBackers") === "true",
        false,
    );
    /* $effect(() => {
        localStorage.setItem("simulateBackers", "" + simulateBackers);
    }); */

    let simulatedBackers: Distribution["participants"] = $state(
        JSON.parse(localStorage.getItem("simulatedBackers") || "[]"),
    );
    $effect(() => {
        localStorage.setItem(
            "simulatedBackers",
            JSON.stringify(simulatedBackers),
        );
    });

    let simulatedPledge = $state(
        +(localStorage.getItem("simulatedPledge") || 10),
    );
    $effect(() => {
        localStorage.setItem("simulatedPledge", "" + simulatedPledge);
    });
</script>

<br />

<div class="inline-options" style="width:fit-content">
    <label>
        <input
            bind:checked={simulateBackers}
            type="checkbox"
            name="simulate-backers"
        />
        Simulate Backers Rewards
    </label>
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
            <label for="simulated-mrp" style="opacity: .5;"
                ><i class="fa-solid fa-coins"></i> Simulate Market Reference Point
                *</label
            >
            <input
                id="simulated-backers-mrp"
                disabled
                type="number"
                value={$roundNumbersBackers
                    ? Math.round($simulateMRP)
                    : $simulateMRP}
            />
        </div>

        <div class="input-group">
            <label for="simulated-backers-goal" style="opacity: .5;"
                ><i class="fa-solid fa-coins"></i> Simulate Goal *</label
            >
            <input
                id="simulated-backers-goal"
                disabled
                type="number"
                value={$roundNumbersBackers
                    ? Math.round($simulateGoal)
                    : $simulateGoal}
            />
            <small> * From Simulate Creators Rewards </small>
        </div>

        <div class="input-group">
            <label for="simulated-backers-pledge"
                ><i class="fa-solid fa-hand-holding-heart"></i> Simulate Pledge Amount</label
            >
            <input
                id="simulated-backers-pledge"
                bind:value={simulatedPledge}
                type="number"
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

    <List
        items={{
            showOrder: true,
            showSize: true,
            editOrder: false,
            showPledge: true,
            participantName: "Backer",
            showTimeline: true,
            sustainableModel: "backers",
            participants: getBackers([
                {
                    pledge: $simulateMRP,
                    nrOfPeople: 1,
                    timestamp: initMRP.timestamp,
                },
                ...simulatedBackers,
            ]),
            roundNumbers: $roundNumbersBackers,
            hideParticipants: true,
            goal: $simulateGoal,
        }}
        tableId="simulation-backers"
    />
{/if}
