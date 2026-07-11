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
                    text: "Artists",
                    parent: 0,
                },
                {
                    id: 2,
                    text: "Performers",
                    parent: 1,
                    showCheckmark: true,
                },
                {
                    id: 3,
                    text: "Songwriters",
                    parent: 1,
                },
                {
                    id: 4,
                    text: "Production",
                    parent: 0,
                },
                {
                    id: 5,
                    text: "Sound Engineers",
                    parent: 4,
                },
                {
                    id: 6,
                    text: "Stage renters",
                    parent: 4,
                },
                {
                    id: 7,
                    text: "Live streaming",
                    parent: 4,
                },
                {
                    id: 8,
                    text: "Operations",
                    parent: 0,
                },
                {
                    id: 9,
                    text: "Organization",
                    parent: 8,
                },
                {
                    id: 10,
                    text: "Marketing",
                    parent: 8,
                },
                {
                    id: 11,
                    text: "Platform",
                    parent: 0,
                },
                {
                    id: 12,
                    text: "humatize.com",
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
