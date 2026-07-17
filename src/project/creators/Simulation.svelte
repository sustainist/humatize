<script lang="ts">
    import {
        initMRP,
        roundNumbersCreators,
        simulateGoal,
        simulateMRP,
    } from "..";
    import { getReferencePoint } from "../../sustainableDistribution";
    import List from "../List.svelte";

    // simulation
    let simulateCreators = $state(
        /* localStorage.getItem("simulateCreators") === "true", */ false,
    );
    /* $effect(() => {
        localStorage.setItem("simulateCreators", "" + simulateCreators);
    }); */

    // mrp
    let simulationMRP = $state(
        +(localStorage.getItem("simulateMRP") || initMRP.mrp),
    );
    $effect(() => {
        localStorage.setItem("simulateMRP", "" + simulationMRP);
    });

    // position
    let simulatePosition = $state(
        +(localStorage.getItem("simulatePosition") || initMRP.position),
    );
    $effect(() => {
        localStorage.setItem("simulatePosition", "" + simulatePosition);
    });

    // participants
    let simulateParticipants = $state(
        +(localStorage.getItem("simulateParticipants") || initMRP.participants),
    );
    $effect(() => {
        localStorage.setItem("simulateParticipants", "" + simulateParticipants);
    });

    // people
    let simulatePeople = $state(
        +(localStorage.getItem("simulatePeople") || initMRP.nrOfPeople),
    );
    $effect(() => {
        localStorage.setItem("simulatePeople", "" + simulatePeople);
    });

    const simulateRefGoal = $derived(
        getReferencePoint({
            share: simulationMRP * simulatePeople,
            position: simulatePosition,
            participants: simulateParticipants,
        }) || 0,
    );

    $effect(() => {
        $simulateGoal = simulateRefGoal;
    });

    $effect(() => {
        $simulateMRP = simulationMRP;
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
            <label for="mrp-participants"
                ><i class="fa-solid fa-list-ol"></i> Participants</label
            >
            <input
                required
                type="number"
                placeholder="Participants"
                id="mrp-participants"
                name="mrp-participants"
                min="1"
                max="100"
                bind:value={simulateParticipants}
                oninput={() => {
                    if (simulatePosition > simulateParticipants)
                        simulatePosition = simulateParticipants;
                }}
            />
        </div>

        <div class="input-group">
            <label for="mrp-position"
                ><i class="fa-solid fa-list-ol"></i> Position</label
            >
            <input
                required
                type="number"
                placeholder="Position"
                id="mrp-position"
                name="mrp-position"
                min="1"
                max={simulateParticipants}
                bind:value={simulatePosition}
            />
        </div>

        <div class="input-group">
            <label for="mrp-amount"
                ><i class="fas fa-coins"></i> Market Reference Point</label
            >
            <input
                required
                type="number"
                placeholder="Amount"
                id="mrp-amount"
                name="mrp-amount"
                bind:value={simulationMRP}
            />
        </div>

        <div class="input-group">
            <label for="mrp-people">
                <i class="fa-solid fa-users"></i> People</label
            >
            <input
                required
                type="number"
                placeholder="People"
                id="mrp-people"
                name="mrp-people"
                min="1"
                bind:value={simulatePeople}
            />
        </div>
    </div>

    <div>
        <List
            items={{
                showOrder: true,
                showSize: true,
                editOrder: false,
                showCompensation: true,
                sustainableModel: "creators",
                goal: simulateRefGoal,
                roundNumbers: $roundNumbersCreators,
                hideParticipants: true,
                participantName: "Creator",
                participants: Array.from(
                    { length: simulateParticipants },
                    (_, i) => ({
                        showCheckmark: simulatePosition === i + 1,
                        nrOfPeople:
                            simulatePosition === i + 1 ? simulatePeople : 1,
                        parent: 0,
                    }),
                ),
            }}
            tableId="simulate-creators"
        />
    </div>
{/if}
