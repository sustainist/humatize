<script lang="ts">
    import { type Distribution } from "../../sustainableDistribution/distributionTautochroneCurve";

    let {
        items,
        tableId,
    }: {
        items: Distribution;
        tableId: string;
    } = $props();

    const siblings = $derived(items.participants);
</script>

<div style="overflow-x:auto;width:100%">
    <table>
        <thead>
            <tr>
                <th colspan="3"> Sustainable Distribution </th>
                {#if !items.hidePeople}
                    <th> People </th>
                {/if}
                <!-- <th>
                    <div>
                        <span> Timeline </span>
                    </div>
                </th> -->
                <th>
                    <div>
                        <span> Pledge </span>
                    </div>
                </th>
                <!-- <th>
                    <div>
                        <span> Rewards </span>
                    </div>
                </th> -->
            </tr>
        </thead>
        <tbody>
            {#each siblings as sibling, i}
                {#if sibling}
                    <tr>
                        <td>
                            {#if sibling.distributionStart && sibling.distributionEnd}
                                {sibling.distributionStart}...{sibling.distributionEnd}
                            {/if}
                        </td>
                        <td>
                            {(sibling.percentageBacker || 0).toFixed(2)}%
                        </td>
                        <td>
                            {#if !sibling.email && i === 0}
                                <i class="fa-solid fa-rocket"></i>
                                Raised
                                <b
                                    >€{Number(
                                        (sibling.rewardBacker || 0).toFixed(2),
                                    )}</b
                                >
                                out of <b>€{items.goal}</b> goal
                            {:else}
                                <b
                                    >€{Number(
                                        (sibling.rewardBacker || 0).toFixed(2),
                                    )}</b
                                >
                            {/if}
                        </td>
                        {#if !items.hidePeople}
                            <td>
                                {#each { length: sibling.nrOfPeople || 0 }}
                                    <i class="fa-solid fa-user"></i>
                                {/each}
                            </td>
                        {/if}
                        <!-- <td>
                            {sibling.timestamp &&
                                new Date(sibling.timestamp).toLocaleString(
                                    "en-US",
                                    {
                                        dateStyle: "short",
                                        timeStyle: "short",
                                    },
                                )}
                        </td> -->
                        <td>
                            <span>
                                €{Number((sibling.pledge || 0).toFixed(2))}
                            </span>
                            <!-- {#if !sibling.email && i === 0}
                                <a
                                    style="white-space:nowrap"
                                    href="/#market-reference-point"
                                    class="supporter-tag"
                                    ><i class="fas fa-coins"></i>
                                    Reference</a
                                >
                            {/if} -->
                        </td>
                        <!-- <td>
                            {#if !sibling.email && i === 0}
                                Raised
                                {Number((sibling.rewardBacker || 0).toFixed(2))}
                                out of
                                {#if items.roundNumbers}
                                    {Math.round(items.goal)}
                                {:else}
                                    {items.goal}
                                {/if} goal
                            {:else}
                                {Number((sibling.rewardBacker || 0).toFixed(2))}
                            {/if}
                        </td> -->
                    </tr>
                {/if}
            {/each}
        </tbody>
    </table>
</div>
