<script lang="ts">
    import {
        getShare,
        type Distribution,
    } from "../../sustainableDistribution/distributionTautochroneCurve";
    import { harmonicRuleDistribution } from "../../sustainableDistribution/distributionHarmonicRule";
    import {
        calculateDistribution,
        type DistributionResult,
    } from "../../sustainableDistribution/distributionLinearDecay";
    import {
        type RankingSnapshot,
        zipfsLaw,
    } from "../../sustainableDistribution/distributionZipfLaw";

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
    distributionHarmonicRule,
    distributionZipfsLaw,
    distributionLiniarDecay,
}: {
    siblings: Distribution["participants"];
    share: number;
    depth: number[];
    distributionHarmonicRule: { position: number; percent: number }[];
    distributionZipfsLaw: RankingSnapshot;
    distributionLiniarDecay: DistributionResult[];
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
            {@const shareHarmonicRule =
                share * (distributionHarmonicRule[i]?.percent || 0)}

            <tr>
                <td>
                    <div class="flex">
                        <div>
                            <span>
                                {[...depth, i + 1].join(".")}
                            </span>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="flex">
                        <div>
                            <span>
                                {#each { length: depth.length } as _, indexDepth}
                                    <span
                                        >&nbsp;&nbsp;&nbsp;{#if indexDepth + 1 === depth.length}└─{/if}</span
                                    >&nbsp;
                                {/each}
                                {#if items.roundNumbers}
                                    {Math.round(
                                        distributionZipfsLaw.distributions[i]
                                            .percentage,
                                    )}%
                                {:else}
                                    {distributionZipfsLaw.distributions[i]
                                        .percentage}%
                                {/if}
                            </span>
                        </div>
                    </div>
                </td>
                <td>
                    <b>€{distributionZipfsLaw.distributions[i].payout}</b>
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
                                    {@html sibling.text || "P" + (i + 1)}
                                </span>
                            </div>
                        </div>
                    </td>
                {/if}
                <!-- <td>
                    {#if sibling.nrOfPeople}({sibling.nrOfPeople}){/if}
                    {#each { length: sibling.nrOfPeople || 0 }}
                        <i class="fa-solid fa-user"></i>
                    {/each}
                </td> -->
                <!-- <td>
                    <span class="indent">
                        {#each { length: depth.length } as _, indexDepth}
                            <span
                                >&nbsp;&nbsp;&nbsp;{#if indexDepth + 1 === depth.length}└─{/if}</span
                            >&nbsp;
                        {/each}
                    </span>

                    <b>
                        {#if items.roundNumbers}
                            {Math.round(
                                distributionZipfsLaw.distributions[i].payout,
                            )}
                        {:else}
                            {distributionZipfsLaw.distributions[i].payout}
                        {/if}
                    </b>

                    {#if sibling.marketReferencePoint}
                        <a href="/#market-reference-point" class="investor-tag"
                            ><i class="fas fa-coins"></i> Reference</a
                        >
                    {/if}
                </td> -->
            </tr>
            {@const children = items.participants.filter((item) => {
                if (item === null || sibling === null) return false;
                return (item.parent || 0) === sibling.id;
            })}
            {@render trs({
                siblings: children,
                share: tautochroneShare,
                depth: [...depth, i + 1],
                distributionHarmonicRule: harmonicRuleDistribution(
                    children.length,
                ),
                distributionZipfsLaw: zipfsLaw({
                    participants: children.length,
                    profit: share,
                    exponent: items.zipfsLawExponent,
                }),
                distributionLiniarDecay: children.length
                    ? calculateDistribution({
                          totalProfit: share,
                          participants: children.length,
                      }).results
                    : [],
            })}
        {/if}
    {/each}
{/snippet}

<div style="overflow-x:auto;width:100%">
    <table>
        <thead>
            <tr>
                <th colspan="3">
                    Sustainable Distribution for €{items.goal} goal</th
                >
                {#if !items.hideParticipants}
                    <th> Participants </th>
                {/if}
                <!-- <th> People </th> -->
                <!-- <th>
                    <div>
                        <span>
                            Rewards
                            <span style="display:inline-block">
                                from goal {#if items.roundNumbers}
                                    {Math.round(items.goal)}
                                {:else}
                                    {items.goal}
                                {/if}</span
                            >
                        </span>
                    </div>
                </th> -->
            </tr>
        </thead>
        <tbody>
            {@render trs({
                siblings,
                share: items.goal,
                distributionHarmonicRule: harmonicRuleDistribution(
                    siblings.length,
                ),
                depth: [],
                distributionZipfsLaw: zipfsLaw({
                    participants: siblings.length,
                    profit: items.goal,
                    exponent: items.zipfsLawExponent,
                }),
                distributionLiniarDecay:
                    siblings.length > 1
                        ? calculateDistribution({
                              totalProfit: items.goal,
                              participants: siblings.length,
                          }).results
                        : [],
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
