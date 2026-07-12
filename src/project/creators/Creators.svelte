<script lang="ts">
    import type { EvaluationExample } from "../../curve";
    import List from "../List.svelte";

    const list: (EvaluationExample | undefined)[] = [
        {
            showOrder: true,
            profit: 1000,
            showSize: true,
            editOrder: false,
            showCompensation: true,
            participantName: "Creator",
            // position: 1,
            participants: [
                {
                    id: 1,
                    text: `<i class="fa-solid fa-masks-theater"></i> Artists`,
                    parent: 0,
                },
                {
                    id: 2,
                    text: `<i class="fa-solid fa-play"></i> Performers`,
                    parent: 1,
                    showCheckmark: true,
                },
                {
                    id: 3,
                    text: `<i class="fa-solid fa-music"></i> Songwriters`,
                    parent: 1,
                },
                {
                    id: 4,
                    text: `<i class="fa-solid fa-industry"></i> Production`,
                    parent: 0,
                },
                {
                    id: 5,
                    text: `<i class="fa-solid fa-headphones"></i> Sound Engineers`,
                    parent: 4,
                },
                {
                    id: 6,
                    text: `<i class="fa-solid fa-theater-masks"></i> Stage renters`,
                    parent: 4,
                },
                {
                    id: 7,
                    text: `<i class="fa-solid fa-video"></i> Live streaming`,
                    parent: 4,
                },
                {
                    id: 8,
                    text: `<i class="fa-solid fa-gears"></i> Operations`,
                    parent: 0,
                },
                {
                    id: 9,
                    text: `<i class="fa-solid fa-building"></i> Organization`,
                    parent: 8,
                },
                {
                    id: 10,
                    text: `<i class="fa-solid fa-bullhorn"></i> Marketing`,
                    parent: 8,
                },
                {
                    id: 11,
                    text: `<i class="fa-solid fa-desktop"></i> Platform`,
                    parent: 0,
                },
                {
                    id: 12,
                    text: `<i class="fa-solid fa-globe"></i> humatize.com`  ,
                    parent: 11,
                },
            ],
        },
    ];
    const index = 0;
</script>

{#if list[index]}
    <List items={list[index]} tableId="creators" />
{:else}
    <p style="color:red">
        &lt;List items=&lbrace;{index}&rbrace; /&gt; not found
    </p>
{/if}
