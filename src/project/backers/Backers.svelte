<script lang="ts">
    import type { EvaluationExample } from "../../curve";
    import List from "../List.svelte";

    const list: (EvaluationExample | undefined)[] = [
        {
            showOrder: true,
            profit: 1000,
            showSize: true,
            editOrder: false,
            showPledge: true,
            participantName: "Backer",
            showTimeline: true,
            participants: [
                {
                    id: 1,
                    text: "Alin Stan",
                    parent: 0,
                    showCheckmark: true,
                    pledge: "$100",
                    timestamp: "2023-10-01T10:00:00Z",
                    person: true
                },
                /* {
                    id: 2,
                    text: "",
                    parent: 0,
                    pledge: "$50",
                    timestamp: "2023-10-02T10:00:00Z",
                },
                {
                    id: 3,
                    text: "",
                    parent: 0,
                    pledge: "$25",
                    timestamp: "2023-10-03T10:00:00Z",
                }, */
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
