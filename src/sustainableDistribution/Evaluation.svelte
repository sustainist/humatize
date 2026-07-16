<script lang="ts">
  import { type Distribution } from ".";
  import Table from "./Table.svelte";

  const { example }: { example: number } = $props();

  const examples: (Distribution | undefined)[] = [
    {
      showOrder: true,
      profit: 1000,
      goal: 1000,
      editOrder: true,
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
      ],
    },
    {
      showSize: true,
      participants: Array(15).fill(null),
      profit: 2000,
      goal: 2000,
      position: 1,
    },
    {
      showOrder: true,
      showSize: true,
      profit: 1000,
      goal: 1000,
      editOrder: true,
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
      ],
    },
  ];
</script>

{#if examples[example]}
  <Table example={examples[example]} tableId={"evaluation-" + example} />
{:else}
  <p style="color:red">
    &lt;Evaluation example=&lbrace;{example}&rbrace; /&gt; not found
  </p>
{/if}
