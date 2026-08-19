<script lang="ts">
    import { getBackers } from ".";
    import { initMRP, roundNumbersBackers } from "..";
    import type { Distribution } from "../../sustainableDistribution/distributionTautochroneCurve";
    import { zipfsLawExponentLive } from "../../sustainableDistribution/distributionZipfLaw";
    import List from "./List.svelte";

    // Simulate Backers
    let simulateBackers = $state(
        localStorage.getItem("simulateBackers") === "true",
    );
    $effect(() => {
        localStorage.setItem("simulateBackers", "" + simulateBackers);
    });

    // simulated backer pledges
    let simulatedBackers: Distribution["participants"] = $state(
        JSON.parse(localStorage.getItem("simulatedBackers") || "[]"),
    );
    $effect(() => {
        localStorage.setItem(
            "simulatedBackers",
            JSON.stringify(simulatedBackers),
        );
    });

    // simulated pledge amount
    let newPledge = $state(+(localStorage.getItem("newPledge") || 10));
    $effect(() => {
        localStorage.setItem("newPledge", "" + newPledge);
    });

    // founder pledge
    let founderPledge = $state(+(localStorage.getItem("founderPledge") || 10));
    $effect(() => {
        localStorage.setItem("founderPledge", "" + founderPledge);
    });

    // zipfs law exponent simulation
    let zipfsLawExponentSimulationBackers = $state(
        +(
            localStorage.getItem("zipfsLawExponentSimulationBackers") ||
            zipfsLawExponentLive
        ),
    );
    $effect(() => {
        localStorage.setItem(
            "zipfsLawExponentSimulationBackers",
            "" + zipfsLawExponentSimulationBackers,
        );
    });

    // goal
    let simulateGoalBackers = $state(
        +(localStorage.getItem("simulateGoalBackers") || 1),
    );
    $effect(() => {
        localStorage.setItem("simulateGoalBackers", "" + simulateGoalBackers);
    });
</script>

<br />

<div class="inline-options" style="width:fit-content">
    <label>
        Simulate Backers Rewards
        <input
            bind:checked={simulateBackers}
            type="checkbox"
            name="simulate-backers"
        />
    </label>
</div>

<br />

{#if simulateBackers}
    <form
        onsubmit={(e) => {
            e.preventDefault();
            simulatedBackers.push({
                pledge: newPledge,
                timestamp: new Date().toISOString(),
            });
        }}
        class="demo-box"
        style="display:flex;flex-direction:column;gap:1rem"
    >
        <div class="input-group">
            <label for="simulate-goal-backers">
                <i class="fa-solid fa-bullseye"></i> Goal</label
            >
            <input
                required
                type="number"
                placeholder="Goal"
                id="simulate-goal-backers"
                name="simulate-goal-backers"
                bind:value={simulateGoalBackers}
            />
        </div>

        <div class="input-group">
            <label for="initial-pledge">
                <i class="fa-solid fa-anchor"></i> Founder Pledge
            </label>
            <input
                id="initial-pledge"
                bind:value={founderPledge}
                type="number"
                min="0"
                name="initial-pledge"
            />
        </div>

        <div class="input-group">
            <label for="new-pledge"
                ><i class="fa-solid fa-hand-holding-heart"></i> New Pledge</label
            >
            <input
                id="new-pledge"
                bind:value={newPledge}
                type="number"
                min="1"
            />
        </div>

        <div class="input-group">
            <label for="zipfs-law-exponent-simulation-backers">
                <i class="fa-solid fa-s"></i> Zipfs Exponent {#if zipfsLawExponentLive === zipfsLawExponentSimulationBackers}
                    (used for this project)
                {:else if zipfsLawExponentSimulationBackers === 1}
                    (real world default)
                {/if}</label
            >
            <input
                required
                type="number"
                placeholder="Zipfs Exponent"
                id="zipfs-law-exponent-simulation-backers"
                name="zipfs-law-exponent-simulation-backers"
                step="0.01"
                min="0"
                max="100"
                bind:value={zipfsLawExponentSimulationBackers}
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
            hidePeople: true,
            participants: getBackers(
                [
                    {
                        pledge: founderPledge,
                        nrOfPeople: 1,
                        timestamp: initMRP.timestamp,
                    },
                    ...simulatedBackers,
                ],
                zipfsLawExponentSimulationBackers,
            ),
            zipfsLawExponent: zipfsLawExponentSimulationBackers,
            roundNumbers: $roundNumbersBackers,
            hideParticipants: true,
            goal: simulateGoalBackers || 100,
        }}
        tableId="simulation-backers"
    />
{/if}
