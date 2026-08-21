<script lang="ts">
    import { roundNumbersCreators } from "..";
    import {
        zipfsLawExponentLive,
        ZipfDistribution,
    } from "../../sustainableDistribution/distributionZipfLaw";
    import Graph from "./SimulationGraph.svelte";
    import List from "./List.svelte";

    // simulation
    let simulateCreators = $state(
        localStorage.getItem("simulateCreators") === "true" ? true : false,
    );
    $effect(() => {
        localStorage.setItem("simulateCreators", "" + simulateCreators);
    });

    // participants
    let simulateParticipants = $state(
        +(localStorage.getItem("simulateParticipants") || 3),
    );
    $effect(() => {
        localStorage.setItem("simulateParticipants", "" + simulateParticipants);
    });

    // goal
    let simulateGoalCreators = $state(
        +(localStorage.getItem("simulateGoalCreators") || 1000),
    );
    $effect(() => {
        localStorage.setItem("simulateGoalCreators", "" + simulateGoalCreators);
    });

    // zipfs Law Exponent
    let zipfsLawExponentSimulationCreators = $state(
        +(localStorage.getItem("zipfsLawExponentSimulationCreators") || 1),
    );
    $effect(() => {
        localStorage.setItem(
            "zipfsLawExponentSimulationCreators",
            "" + zipfsLawExponentSimulationCreators,
        );
    });
</script>

<br />

<div class="inline-options" style="width:fit-content">
    <label>
        <input
            bind:checked={simulateCreators}
            type="checkbox"
            name="simulate-creators"
        />
        Simulate Creators Rewards
    </label>
</div>

<br />

{#if simulateCreators}
    <div class="demo-box" style="display:flex;flex-direction:column; gap:1rem">
        <div class="input-group">
            <label for="simulate-goal-creators">
                <i class="fa-solid fa-bullseye"></i> Goal</label
            >
            <input
                required
                type="number"
                placeholder="Goal"
                id="simulate-goal-creators"
                name="simulate-goal-creators"
                bind:value={simulateGoalCreators}
            />
        </div>

        <div class="input-group">
            <label for="simulate-participants"
                ><i class="fa-solid fa-list-ol"></i> Participants</label
            >
            <input
                required
                type="number"
                placeholder="Participants"
                id="simulate-participants"
                name="simulate-participants"
                min="1"
                max="1000"
                bind:value={simulateParticipants}
            />
        </div>

        <div class="input-group">
            <label for="zipfs-law-exponent-simulation">
                <i class="fa-solid fa-s"></i> Zipfs Exponent {#if zipfsLawExponentLive === zipfsLawExponentSimulationCreators}
                    (used for this project)
                {:else if zipfsLawExponentSimulationCreators === 1}
                    (real world default)
                {/if}</label
            >
            <input
                required
                type="number"
                placeholder="Zipfs Exponent"
                id="zipfs-law-exponent-simulation"
                name="zipfs-law-exponent-simulation"
                step="0.01"
                min="0"
                max="100"
                bind:value={zipfsLawExponentSimulationCreators}
            />
        </div>
    </div>

    <Graph
        zipfsLawExponent={zipfsLawExponentSimulationCreators}
        participants={simulateParticipants}
    />

    <div>
        <List
            items={{
                showOrder: true,
                showSize: true,
                editOrder: false,
                showCompensation: true,
                sustainableModel: "creators",
                goal: simulateGoalCreators,
                roundNumbers: $roundNumbersCreators,
                participantName: "Creator",
                zipfsLawExponent: zipfsLawExponentSimulationCreators,
                participants: Array.from(
                    { length: simulateParticipants },
                    (_, i) => ({
                        nrOfPeople: 1,
                        parent: 0,
                    }),
                ),
            }}
            tableId="simulate-creators"
        />
    </div>
{/if}
