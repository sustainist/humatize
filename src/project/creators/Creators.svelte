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
                    text: "A",
                    parent: 0,
                },
                {
                    id: 2,
                    text: "B",
                    parent: 0,
                },
                {
                    id: 3,
                    text: "A A",
                    parent: 1,
                    showCheckmark: true,
                },
                {
                    id: 4,
                    text: "A B",
                    parent: 1,
                },
                {
                    id: 5,
                    text: "A B A",
                    parent: 4,
                },
                {
                    id: 6,
                    text: "A B B",
                    parent: 4,
                },
                {
                    id: 7,
                    text: "A B B A",
                    parent: 6,
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
