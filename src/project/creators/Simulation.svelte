<script lang="ts">
    import { roundedCreators } from "..";
    import { getReferencePoint } from "../../curve";
    import List from "../List.svelte";
    // simulation
    let simulateCreators = $state(
        localStorage.getItem("simulateCreators") === "true",
    );
    $effect(() => {
        localStorage.setItem("simulateCreators", "" + simulateCreators);
    });
    // amount
    let simulateAmount = $state(+(localStorage.getItem("simulateAmount") || 0));
    $effect(() => {
        localStorage.setItem("simulateAmount", "" + simulateAmount);
    });
    // position
    let simulatePosition = $state(
        +(localStorage.getItem("simulatePosition") || 1),
    );
    $effect(() => {
        localStorage.setItem("simulatePosition", "" + simulatePosition);
    });
    // participants
    let simulateParticipants = $state(
        +(localStorage.getItem("simulateParticipants") || 1),
    );
    $effect(() => {
        localStorage.setItem("simulateParticipants", "" + simulateParticipants);
    });

    const estimatedGoal = $derived(
        getReferencePoint({
            share: simulateAmount,
            position: simulatePosition,
            participants: simulateParticipants,
        }) || 0,
    );
</script>

<br />

<div class="inline-options" style="width:fit-content">
    <label
        ><input
            bind:checked={simulateCreators}
            type="checkbox"
            name="simulate-creators"
        /> Simulate Creators Rewards</label
    >
</div>

<br />

{#if simulateCreators}
    <div class="demo-box" style="display:flex;flex-direction:column; gap:1rem">
        <div class="input-group">
            <label for="mrp-amount"
                ><i class="fa-solid fa-scale-balanced"></i> Pay Reference Point</label
            >
            <input
                required
                type="number"
                placeholder="Amount"
                id="mrp-amount"
                name="mrp-amount"
                bind:value={simulateAmount}
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
            />
        </div>

        <div class="inline-options">
            <label>
                <input type="checkbox" bind:checked={$roundedCreators} /> Round numbers
                (list above too)
            </label>
        </div>
    </div>

    <div>
        <h5>
            <i class="fa-solid fa-coins"></i> Simulated Goal: {Math.round(
                estimatedGoal,
            )}
        </h5>
    </div>

    <div>
        <List
            items={{
                profit: estimatedGoal,
                showOrder: true,
                showSize: true,
                editOrder: false,
                showCompensation: true,
                participants: Array.from(
                    { length: simulateParticipants },
                    (_, i) => ({
                        id: i + 1,
                        showCheckmark: simulatePosition === i + 1,
                        text: `Participant ${i + 1}`,
                        parent: 0,
                    }),
                ),
            }}
            tableId="simulate-creators"
        />
    </div>
{/if}
