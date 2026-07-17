<script lang="ts">
    import { onMount } from "svelte";
    import {
        addShares,
        curveOrientation,
        getShare,
        type Distribution,
    } from "../sustainableDistribution";
    import Curve from "../sustainableDistribution/Curve.svelte";

    let {
        items,
        tableId,
    }: {
        items: Distribution;
        tableId: string;
    } = $props();

    let showInputProfit = $state(false);
    let showInputNrOfParticipants = $state(false);

    const siblings = $derived(
        items.sustainableModel === "creators"
            ? items.participants.filter(
                  (item1) => (item1 || { parent: 0 }).parent === 0,
              )
            : items.sustainableModel === "backers"
              ? items.participants
              : [],
    );
</script>

{#snippet trs(
    siblings: Distribution["participants"],
    share = 0,
    depth: number[] = [],
)}
    {#each siblings as sibling, i}
        {@const { share: tautochroneShare, percentage: tautochronePercentage } =
            getShare({
                profit: share,
                position: i + 1,
                participants: siblings.length,
            })}

        <tr>
            {#if items.showOrder}
                {#if items.sustainableModel === "creators"}
                    <td>
                        <div class="flex">
                            <div>
                                <span style="white-space:nowrap">
                                    {[...depth, i + 1].join(".")}
                                </span>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="flex">
                            <div>
                                <span style="white-space:nowrap">
                                    <!-- {[...depth, i + 1].join(".")}
                                <span style="opacity:0.5">|</span> -->
                                    {#each { length: depth.length } as _, indexDepth}
                                        <span
                                            >&nbsp;&nbsp;&nbsp;{#if indexDepth + 1 === depth.length}└─{/if}</span
                                        >&nbsp;
                                    {/each}
                                    {#if items.roundNumbers}
                                        {Math.round(
                                            tautochronePercentage * 100,
                                        )}%
                                    {:else}
                                        {tautochronePercentage * 100}%
                                    {/if}
                                </span>
                            </div>
                        </div>
                    </td>
                {:else}
                    <td colspan="2">
                        {#if sibling?.distributionStart && sibling?.distributionEnd}
                            {sibling?.distributionStart}...{sibling?.distributionEnd}
                        {/if}
                    </td>
                {/if}
                {#if !items.hideParticipants}
                    <td>
                        <div class="flex">
                            <div class="participant">
                                <span class="indent">
                                    {#each { length: depth.length } as _, indexDepth}
                                        <span
                                            >&nbsp;&nbsp;&nbsp;{#if indexDepth + 1 === depth.length}└─{/if}</span
                                        >&nbsp;
                                    {/each}
                                </span>
                                <!-- {#if items.sustainableModel === "backers"}
                                    <span>
                                        <i class="fa-solid fa-user"></i>&nbsp;
                                    </span>
                                {/if} -->
                                <span>
                                    {@html sibling?.text}
                                </span>
                            </div>
                        </div>
                    </td>
                {/if}
                {#if !items.hidePeople}
                    <td>
                        {#if items.participantName === "Creator" && sibling?.nrOfPeople}({sibling?.nrOfPeople}){/if}
                        {#each { length: sibling?.nrOfPeople || 0 }}
                            <i class="fa-solid fa-user"></i>
                        {/each}
                    </td>
                {/if}
            {/if}
            {#if items.showSize}
                {#if items.showCompensation}
                    <td style="white-space:nowrap">
                        <span class="indent">
                            <!-- {#each { length: depth.length } as _}
                                <span>&middot;</span>
                            {/each} -->
                            {#each { length: depth.length } as _, indexDepth}
                                <!-- <span>&middot;</span> -->
                                <span
                                    >&nbsp;&nbsp;&nbsp;{#if indexDepth + 1 === depth.length}└─{/if}</span
                                >&nbsp;
                            {/each}
                        </span>

                        <b>
                            {#if items.roundNumbers}
                                {Math.round(tautochroneShare) /
                                    (sibling?.nrOfPeople || 1)}
                            {:else}
                                {tautochroneShare / (sibling?.nrOfPeople || 1)}
                            {/if}
                        </b>

                        {#if sibling?.showCheckmark}
                            <!-- <span style="opacity:0.5">|</span> -->
                            <!-- midpoint -->
                            <a
                                style="white-space:nowrap"
                                href="/#market-reference-point"
                                class="investor-tag"
                                ><i class="fas fa-coins"></i> Reference</a
                            >
                        {/if}
                    </td>
                {/if}
            {/if}

            {#if items.showTimeline}
                <td>
                    {sibling?.timestamp &&
                        new Date(sibling.timestamp).toLocaleString("en-US", {
                            dateStyle: "short",
                            timeStyle: "short",
                        })}
                </td>
            {/if}

            {#if items.showPledge}
                <td>
                    <span>
                        {sibling?.pledge || 0}
                    </span>
                    {#if !sibling?.email && i === 0}
                        <a
                            style="white-space:nowrap"
                            href="/#market-reference-point"
                            class="supporter-tag"
                            ><i class="fas fa-coins"></i>
                            Reference</a
                        >
                    {/if}
                </td>
                <td>
                    {#if items.roundNumbers}
                        {Math.round(sibling?.rewardBacker || 0)}
                    {:else}
                        {sibling?.rewardBacker || 0}
                    {/if}
                    {#if !sibling?.email && i === 0}out of
                        {#if items.roundNumbers}
                            {Math.round(items.goal)}
                        {:else}
                            {items.goal}
                        {/if} goal
                    {/if}
                </td>
            {/if}
        </tr>
        {@render trs(
            items.participants.filter((item) => {
                if (item === null || sibling === null) return false;
                return (item.parent || 0) === sibling.id;
            }),
            tautochroneShare,
            [...depth, i + 1],
        )}
    {/each}
{/snippet}
<div style="display:flex;flex-wrap:wrap;gap:1ch;overflow-x:auto">
    {#if typeof items.position === "number"}
        <div class="curve">
            <Curve
                participants={items.participants.length}
                position={items.position || 1}
                orientation={$curveOrientation}
                profit={items.goal}
                onPositionChange={(position) => {
                    if (items && items.position !== position) {
                        items.position = position;
                        items = { ...items };
                    }
                }}
            />
            <form>
                <small>
                    Curve Orientation:
                    {#each [["v", "vertical"], ["h", "horizontal"]] as [value, label]}
                        <label>
                            <input
                                name="{tableId}-curve-orientation"
                                type="radio"
                                bind:group={$curveOrientation}
                                {value}
                            />{label}
                        </label>
                    {/each}
                </small>
            </form>
        </div>
    {/if}

    <div style="overflow-x:auto;width:100%">
        <table>
            <thead>
                <tr>
                    {#if items.showOrder}
                        <th colspan="2">
                            <!-- <IconOrder /> -->
                            Sustainable Distribution
                        </th>
                        {#if !items.hideParticipants}
                            <th>
                                <!-- <IconParticipants /> -->
                                <!-- Participants -->
                                <!-- {items.participantName} -->
                                Participants
                            </th>
                        {/if}
                        {#if !items.hidePeople}
                            <th> People </th>
                        {/if}
                    {/if}
                    {#if items.showSize}
                        {#if items.showCompensation}
                            <th>
                                <div>
                                    <span>
                                        <!-- <IconShare /> -->
                                        Rewards
                                        <span style="display:inline-block"
                                            >(Goal:{#if items.roundNumbers}
                                                {Math.round(items.goal)}
                                            {:else}
                                                {items.goal}
                                            {/if})</span
                                        >
                                    </span>
                                </div>
                            </th>
                        {/if}
                    {/if}
                    {#if items.showTimeline}
                        <th>
                            <div>
                                <span> Timeline </span>
                            </div>
                        </th>
                    {/if}
                    {#if items.showPledge}
                        <th>
                            <div>
                                <span> Pledge </span>
                            </div>
                        </th>
                        <th>
                            <div>
                                <span> Rewards </span>
                            </div>
                        </th>
                    {/if}
                </tr>
            </thead>
            <tbody>
                {@render trs(siblings, items.goal)}
            </tbody>
        </table>
    </div>
</div>

<style>
    .flex {
        display: flex;
        flex-wrap: wrap;
    }
    /*.indent {
        color: gray;
        line-height: 0;
        display: inline-flex;
        padding: 0 0.5ch;
        gap: 1ch;

        &:empty {
            display: none;
        }
    }*/
    .participant {
        display: flex;
        align-items: center;
    }
</style>
