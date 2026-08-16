<script lang="ts">
    import { harmonicSplit } from "..";
    import { getShare, type Distribution } from "../../sustainableDistribution";

    let {
        items,
        tableId,
    }: {
        items: Distribution;
        tableId: string;
    } = $props();

    const siblings = $derived(
        items.participants.filter(
            (item1) => (item1 || { parent: 0 }).parent === 0,
        ),
    );
</script>

{#snippet trs({
    siblings,
    share = 0,
    depth = [],
    percentages,
}: {
    siblings: Distribution["participants"];
    share: number;
    depth: number[];
    percentages: { position: number; percent: number }[];
})}
    {#each siblings as sibling, i}
        {#if sibling}
            {@const {
                share: tautochroneShare,
                percentage: tautochronePercentage,
            } = getShare({
                profit: share,
                position: i + 1,
                participants: siblings.length,
            })}

            {@const fairShare = share * (percentages[i]?.percent || 0)}

            <tr>
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
                                {#each { length: depth.length } as _, indexDepth}
                                    <span
                                        >&nbsp;&nbsp;&nbsp;{#if indexDepth + 1 === depth.length}└─{/if}</span
                                    >&nbsp;
                                {/each}
                                {#if items.roundNumbers}
                                    <!-- {Math.round(tautochronePercentage * 100)}% | -->
                                    {Math.round(
                                        (percentages[i]?.percent || 0) * 100,
                                    )}%
                                {:else}
                                    <!-- {tautochronePercentage * 100}% |  -->
                                    {(percentages[i]?.percent || 0) * 100}
                                {/if}
                            </span>
                        </div>
                    </div>
                </td>
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
                                <span>
                                    {@html sibling.text}
                                </span>
                            </div>
                        </div>
                    </td>
                {/if}
                <td>
                    {#if sibling.nrOfPeople}({sibling.nrOfPeople}){/if}
                    {#each { length: sibling.nrOfPeople || 0 }}
                        <i class="fa-solid fa-user"></i>
                    {/each}
                </td>
                <td style="white-space:nowrap">
                    <span class="indent">
                        {#each { length: depth.length } as _, indexDepth}
                            <span
                                >&nbsp;&nbsp;&nbsp;{#if indexDepth + 1 === depth.length}└─{/if}</span
                            >&nbsp;
                        {/each}
                    </span>

                    <b>
                        {#if items.roundNumbers}
                            <!-- {Math.round(
                                tautochroneShare / (sibling.nrOfPeople || 1),
                            )} | -->

                            {Math.round(fairShare)}
                        {:else}
                            <!-- {tautochroneShare / (sibling.nrOfPeople || 1)} | -->
                            {fairShare}
                        {/if}
                    </b>

                    {#if sibling.marketReferencePoint}
                        <a
                            style="white-space:nowrap"
                            href="/#market-reference-point"
                            class="investor-tag"
                            ><i class="fas fa-coins"></i> Reference</a
                        >
                    {/if}
                </td>
            </tr>
            {@const children = items.participants.filter((item) => {
                if (item === null || sibling === null) return false;
                return (item.parent || 0) === sibling.id;
            })}
            {@render trs({
                siblings: children,
                share: tautochroneShare,
                depth: [...depth, i + 1],
                percentages: harmonicSplit(children.length),
            })}
        {/if}
    {/each}
{/snippet}

<div style="overflow-x:auto;width:100%">
    <table>
        <thead>
            <tr>
                <th colspan="2"> Sustainable Distribution </th>
                {#if !items.hideParticipants}
                    <th> Participants </th>
                {/if}
                <th> People </th>
                <th>
                    <div>
                        <span>
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
            </tr>
        </thead>
        <tbody>
            {@render trs({
                siblings,
                share: items.goal,
                percentages: harmonicSplit(siblings.length),
                depth: [],
            })}
        </tbody>
    </table>
</div>

<style>
    .flex {
        display: flex;
        flex-wrap: wrap;
    }
    .participant {
        display: flex;
        align-items: center;
    }
</style>
