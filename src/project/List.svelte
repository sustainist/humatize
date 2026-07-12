<script lang="ts">
    import { onMount } from "svelte";
    import {
        curveOrientation,
        getShare,
        type EvaluationExample,
    } from "../curve";
    import Curve from "../curve/Curve.svelte";
    import IconOrder from "../curve/IconOrder.svelte";
    import IconParticipants from "../curve/IconParticipants.svelte";
    import IconSize from "../curve/IconSize.svelte";
    import IconShare from "../curve/IconShare.svelte";

    let {
        items,
        tableId,
    }: {
        items: EvaluationExample;
        tableId: string;
    } = $props();

    let showInputProfit = $state(false);
    let showInputNrOfParticipants = $state(false);

    const siblings = $derived(
        items.participants.filter(
            (item1) => (item1 || { parent: 0 }).parent === 0,
        ),
    );
</script>

{#snippet trs(
    siblings: EvaluationExample["participants"],
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
                <td>
                    <div class="flex">
                        <div class="participant">
                            <span class="indent">
                                {#each { length: depth.length } as _, indexDepth}
                                    <!-- <span>&middot;</span> -->
                                    <span
                                        >&nbsp;&nbsp;&nbsp;{#if indexDepth + 1 === depth.length}└─{/if}</span
                                    >&nbsp;
                                {/each}
                            </span>
                            {#if sibling?.person}
                                <span>
                                    <i class="fa-solid fa-user"></i>&nbsp;
                                </span>
                            {/if}
                            <span>
                                {@html sibling?.text}
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
                                {Math.round(tautochronePercentage * 100)}%
                            </span>
                        </div>
                    </div>
                </td>
            {/if}
            {#if items.showSize}
                <!-- <td style="white-space:nowrap">
                    <span class="indent">
                        {#each { length: depth.length } as _}
                            <span>&middot;</span>
                        {/each}
                    </span>
                    {#if typeof example.position === "number"}
                        <label>
                            <input
                                class="share"
                                type="radio"
                                name="{tableId}-position-{depth.length}"
                                checked={example.position === i + 1}
                                oninput={() => {
                                    example.position = i + 1;
                                    example = { ...example };
                                }}
                                value={i + 1}
                            />
                            <span>
                                {tautochronePercentage * 100}%
                            </span>
                        </label>
                    {:else}
                        {tautochronePercentage * 100}%
                    {/if}
                </td> -->

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
                            {Math.round(tautochroneShare)}
                        </b>

                        {#if sibling?.showCheckmark}
                            <!-- <span style="opacity:0.5">|</span> -->
                            <!-- midpoint -->
                            <a href="/#" class="investor-tag"
                                ><i class="fa-solid fa-scale-balanced"></i> ref</a
                            >
                        {/if}
                    </td>
                {/if}
            {/if}

            {#if items.showTimeline}
                <td>
                    {new Date(sibling?.timestamp || "").toLocaleString(
                        "en-US",
                        {
                            dateStyle: "short",
                            timeStyle: "short",
                        },
                    )}
                </td>
            {/if}

            {#if items.showPledge}
                <td>
                    <span>
                        {sibling?.pledge || 0}
                    </span>
                    {#if sibling?.showCheckmark}
                        <!-- <span style="opacity:0.5">|</span>
                        init -->
                        <a href="/#" class="supporter-tag"
                            ><i class="fa-solid fa-coins"></i> init</a
                        >
                    {/if}
                </td>
            {/if}

            <!-- <td>
                {getReferencePoint({
            share: tautochroneShare,
            position: i + 1,
            participants: example.participants.length,
          })}
            </td> -->
        </tr>
        {@render trs(
            items.participants.filter((item) => {
                if (item === null || sibling === null) return false;
                return item.parent === sibling.id;
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
                profit={items.profit}
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
                        <th>
                            <!-- <IconParticipants /> -->
                            <!-- Participants -->
                            <!-- {items.participantName} -->
                            Participants
                        </th>
                        <th>
                            <!-- <IconOrder /> -->
                            Sustainable Distribution
                        </th>
                    {/if}
                    {#if items.showSize}
                        <!-- <th>
                            <div class="thWithInp">
                                {#if !example.showOrder}
                                    <label>
                                        <input
                                            bind:checked={
                                                showInputNrOfParticipants
                                            }
                                            type="checkbox"
                                            name="{tableId}-show-nr-participants"
                                            title="Edit number of participants"
                                        />{#if !showInputNrOfParticipants}
                                            <span
                                                title="Participants"
                                                style="font-weight: normal;"
                                            >
                                                {example.participants.length}
                                            </span>
                                        {/if}
                                    </label>
                                    {#if showInputNrOfParticipants}
                                        <label>
                                            <input
                                                name="{tableId}-participants"
                                                type="number"
                                                min="0"
                                                max="1000"
                                                value={example.participants
                                                    .length}
                                                oninput={(e) => {
                                                    let value =
                                                        +e.currentTarget.value;
                                                    if (value > 1000) {
                                                        value = 1000;
                                                        e.currentTarget.value =
                                                            "" + value;
                                                    }
                                                    example.participants =
                                                        Array(value).fill(null);
                                                    example = { ...example };
                                                }}
                                                style="width:8ch"
                                                title="Participants"
                                            />
                                        </label>
                                    {/if}
                                {/if}
                                <span>
                                    <IconSize />
                                    Size
                                </span>
                            </div>
                        </th> -->

                        {#if items.showCompensation}
                            <th>
                                <div>
                                    <!-- <label>
                                    <input
                                        bind:checked={showInputProfit}
                                        type="checkbox"
                                        name="{tableId}-show-edit-profit"
                                        title="Edit profit"
                                    />{#if !showInputProfit}
                                        <span
                                            title="Profit"
                                            style="font-weight:normal"
                                        >
                                            {example.profit}
                                        </span>
                                    {/if}
                                </label> -->
                                    <!-- {#if showInputProfit}
                                    <label>
                                        <input
                                            name="{tableId}-profit"
                                            class="profit"
                                            min="0"
                                            type="number"
                                            value={example.profit}
                                            oninput={(e) => {
                                                example.profit =
                                                    +e.currentTarget.value;
                                                example = { ...example };
                                            }}
                                            style="width:8ch"
                                            title="Profit"
                                        />
                                    </label>
                                {/if} -->
                                    <span>
                                        <!-- <IconShare /> -->
                                        Compensation
                                        <span style="display:inline-block"
                                            >(Goal: {items.profit})</span
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
                    {/if}
                </tr>
            </thead>
            <tbody>
                {@render trs(siblings, items.profit)}
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
