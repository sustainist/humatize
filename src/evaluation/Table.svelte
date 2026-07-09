<script lang="ts">
  import { onMount } from "svelte";
  import {
    curveOrientation,
    getReferencePoint,
    getShare,
    type EvaluationExample,
  } from ".";
  import Curve from "./Curve.svelte";
  import IconOrder from "./IconOrder.svelte";
  import IconParticipants from "./IconParticipants.svelte";
  import IconShare from "./IconShare.svelte";
  import IconSize from "./IconSize.svelte";

  let {
    example,
    tableId,
  }: {
    example: EvaluationExample;
    tableId: string;
  } = $props();

  function getLargestId() {
    return example.participants.reduce(
      (maxId, item) => Math.max(maxId, item?.id || 0),
      0,
    );
  }

  function createNewItem(
    text: string,
    parent: number,
    position?:
      | { bellow: number; above?: never }
      | { above: number; bellow?: never },
  ) {
    const largestId = getLargestId();
    const newId = largestId + 1;
    const newItem = { id: newId, text, parent };

    if (typeof position?.above === "number") {
      const index = example.participants.findIndex(
        (item) => item?.id === position.above,
      );
      example.participants.splice(index, 0, newItem);
    } else if (typeof position?.bellow === "number") {
      const index = example.participants.findIndex(
        (item) => item?.id === position.bellow,
      );
      example.participants.splice(index + 1, 0, newItem);
    } else {
      example.participants.push(newItem);
    }
    editing = null;
    example = { ...example };
  }

  function updateItem(id: number, text: string) {
    const item = example.participants.find((item) => item?.id === id);
    if (item) {
      item.text = text;
    }
  }

  function deleteItem(id: number) {
    const itemsToDelete = [id];
    let i = 0;
    while (i < itemsToDelete.length) {
      const currentId = itemsToDelete[i];
      const children = example.participants.filter(
        (item) => item?.parent === currentId,
      );
      children.forEach((child) => {
        if (child) itemsToDelete.push(child.id);
      });
      i++;
    }
    example.participants = [
      ...example.participants.filter(
        (item) => item && !itemsToDelete.includes(item.id),
      ),
    ];
    example = { ...example };
  }

  function moveItem(
    id: number,
    parent: number,
    direction: "up" | "down" | "in" | "out",
  ) {
    let prevItem: (typeof example.participants)[number] | undefined;
    let prevI: number | undefined;
    let currentItem: (typeof example.participants)[number] | undefined;
    let currentI: number | undefined;

    if (direction === "up") {
      for (let i = 0; i < example.participants.length; i++) {
        const item1 = example.participants[i];
        if (item1?.parent === parent) {
          if (item1.id === id) {
            currentItem = { ...item1 };
            currentI = i;
            break;
          }
          prevI = i;
          prevItem = { ...item1 };
        }
      }

      if (
        prevItem !== undefined &&
        prevI !== undefined &&
        currentItem !== undefined &&
        currentI !== undefined
      ) {
        example.participants[prevI] = currentItem;
        example.participants[currentI] = prevItem;
      }
    } else if (direction === "down") {
      for (let i = 0; i < example.participants.length; i++) {
        const item1 = example.participants[i];
        if (item1?.parent === parent) {
          if (currentItem) {
            prevI = i;
            prevItem = { ...item1 };
            break;
          }
          if (item1.id === id) {
            currentItem = { ...item1 };
            currentI = i;
          }
        }
      }

      if (
        prevItem !== undefined &&
        prevI !== undefined &&
        currentItem !== undefined &&
        currentI !== undefined
      ) {
        example.participants[currentI] = prevItem;
        example.participants[prevI] = currentItem;
      }
    } else if (direction === "in") {
      for (let i = 0; i < example.participants.length; i++) {
        const item1 = example.participants[i];
        if (item1?.parent === parent) {
          if (item1.id === id) {
            currentItem = { ...item1 };
            currentI = i;
            break;
          }
          prevItem = { ...item1 };
        }
      }

      if (
        prevItem !== undefined &&
        prevItem !== null &&
        currentItem !== undefined &&
        currentItem !== null &&
        currentI !== undefined
      ) {
        currentItem.parent = prevItem.id;
        example.participants.splice(currentI, 1, currentItem);
        parent = prevItem.id;
      }
    } else if (direction === "out") {
      for (let i = 0; i < example.participants.length; i++) {
        const item1 = example.participants[i];
        if (item1?.id === parent) {
          prevI = i;
          prevItem = { ...item1 };
          break;
        }
      }

      for (let i = 0; i < example.participants.length; i++) {
        const item1 = example.participants[i];
        if (item1?.id === id) {
          currentI = i;
          currentItem = { ...item1 };
          break;
        }
      }

      if (
        prevItem !== undefined &&
        prevItem !== null &&
        prevI !== undefined &&
        currentItem !== undefined &&
        currentItem !== null &&
        currentI !== undefined
      ) {
        currentItem.parent = prevItem.parent;
        example.participants.splice(currentI, 1);
        example.participants.splice(prevI + 1, 0, currentItem);
        parent = prevItem.parent;
      }
    }

    example = { ...example };
    editing = null;
  }

  let editing: {
    id: number;
    above?: string;
    bellow?: string;
    append?: string;
    update?: string;
    delete?: boolean;
  } | null = $state(null);

  let showInputProfit = $state(false);
  let showInputNrOfParticipants = $state(false);

  const siblings = $derived(
    example.participants.filter(
      (item1) => (item1 || { parent: 0 }).parent === 0,
    ),
  );

  let initialParticipants: EvaluationExample["participants"] = $state([]);

  onMount(() => {
    initialParticipants = [...example.participants];
  });
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
    {#if example.editOrder}
      <!-- Create Above -->
      {#if sibling !== null && editing?.id === sibling.id && typeof editing?.above === "string"}
        <tr>
          <td colspan="2">
            <textarea name="{tableId}-above" bind:value={editing.above}
            ></textarea>
            <br />
            <button
              onpointerdown={() => {
                createNewItem(editing?.above || "", sibling.parent, {
                  above: sibling.id,
                });
              }}>Save</button
            >
            <button
              onpointerdown={() => {
                editing = {
                  id: sibling.id,
                };
              }}>Cancel</button
            >
          </td>
        </tr>
      {/if}
    {/if}
    <tr>
      {#if example.showOrder}
        <td>
          <div class="flex">
            {#if example.editOrder && sibling !== null}
              {#if editing?.id === sibling.id}
                <div class="edit full">
                  <div>
                    <label>
                      <input
                        type="checkbox"
                        checked
                        oninput={() => (editing = null)}
                        name="{tableId}-order-{sibling.id}"
                        placeholder="order id:{sibling.id}"
                      />
                    </label>
                  </div>
                  <!-- Create -->
                  <div>
                    Create
                    <button
                      disabled={typeof editing?.above === "string"}
                      onpointerdown={() => {
                        editing = {
                          id: sibling.id,
                          above: "",
                        };
                      }}>Above</button
                    >
                    <button
                      disabled={typeof editing?.bellow === "string"}
                      onpointerdown={() => {
                        editing = {
                          id: sibling.id,
                          bellow: "",
                        };
                      }}>Bellow</button
                    >
                    <button
                      disabled={typeof editing?.append === "string"}
                      onpointerdown={() => {
                        editing = {
                          id: sibling.id,
                          append: "",
                        };
                      }}>Append</button
                    >
                  </div>
                  <!-- Update -->
                  <div>
                    Update
                    <button
                      disabled={typeof editing?.update === "string"}
                      onpointerdown={() => {
                        editing = {
                          id: sibling.id,
                          update: sibling.text,
                        };
                      }}>Update</button
                    >
                  </div>
                  <!-- Delete -->
                  <div>
                    Delete
                    <button
                      disabled={editing?.delete}
                      onpointerdown={() => {
                        editing = {
                          id: sibling.id,
                          delete: true,
                        };
                      }}>Delete</button
                    >
                    {#if editing?.delete}
                      <button
                        onpointerdown={() => {
                          deleteItem(sibling.id);
                          editing = null;
                        }}>Yes</button
                      >
                      <button
                        onpointerdown={() => {
                          editing = {
                            id: sibling.id,
                          };
                        }}>No</button
                      >
                    {/if}
                  </div>
                  <!-- Move -->
                  <div>
                    Move
                    <button
                      disabled={!i}
                      onpointerdown={() => {
                        moveItem(sibling.id, sibling.parent, "up");
                      }}>Up</button
                    >
                    <button
                      disabled={siblings.length === i + 1}
                      onpointerdown={() => {
                        moveItem(sibling.id, sibling.parent, "down");
                      }}>Down</button
                    >
                    <button
                      disabled={i === 0}
                      onpointerdown={() => {
                        moveItem(sibling.id, sibling.parent, "in");
                      }}>In</button
                    >
                    <button
                      disabled={sibling.parent === 0}
                      onpointerdown={() => {
                        moveItem(sibling.id, sibling.parent, "out");
                      }}>Out</button
                    >
                  </div>
                </div>
              {:else}
                <div class="edit">
                  <div>
                    <label>
                      <input
                        type="checkbox"
                        oninput={() => (editing = editing = { id: sibling.id })}
                        name="{tableId}-order-{sibling.id}"
                        placeholder="order id:{sibling.id}"
                      />
                    </label>
                  </div>
                </div>
              {/if}
            {/if}

            <div>
              <span>
                {[...depth, i + 1].join(".")}
              </span>
            </div>
          </div>
        </td>
        <td>
          <div class="flex">
            <div class="participant">
              <span class="indent">
                {#each { length: depth.length } as _}
                  <span>&middot;</span>
                {/each}
              </span>

              {#if sibling !== null && example.editOrder && editing?.id === sibling.id && typeof editing?.update === "string"}
                <div>
                  <textarea name="{tableId}-update" bind:value={editing.update}
                  ></textarea>
                  <br />
                  <button
                    onpointerdown={() => {
                      updateItem(sibling.id, editing?.update || "");
                      editing = null;
                    }}>Save</button
                  >
                  <button
                    onpointerdown={() => {
                      editing = {
                        id: sibling.id,
                      };
                    }}>Cancel</button
                  >
                </div>
              {:else}
                {sibling?.text}
              {/if}
            </div>

            {#if example.editOrder}
              <!-- Create Append -->
              {#if sibling !== null && editing?.id === sibling.id && typeof editing?.append === "string"}
                <div class="full">
                  <textarea name="{tableId}-append" bind:value={editing.append}
                  ></textarea>
                  <br />
                  <button
                    onpointerdown={() => {
                      createNewItem(editing?.append || "", sibling.id);
                      editing = null;
                    }}>Save</button
                  >
                  <button
                    onpointerdown={() => {
                      editing = {
                        id: sibling.id,
                      };
                    }}>Cancel</button
                  >
                </div>
              {/if}
            {/if}
          </div>
        </td>
      {/if}
      {#if example.showSize}
        <td style="white-space:nowrap">
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
        </td>
        <td style="white-space:nowrap">
          <span class="indent">
            {#each { length: depth.length } as _}
              <span>&middot;</span>
            {/each}
          </span>

          <b>
            {tautochroneShare}
          </b>
        </td>

        <td>
          <!-- {getReferencePoint({
            share: tautochroneShare,
            position: i + 1,
            participants: example.participants.length,
          })} -->
        </td>
      {/if}
    </tr>
    {@render trs(
      example.participants.filter((item) => {
        if (item === null || sibling === null) return false;
        return item.parent === sibling.id;
      }),
      tautochroneShare,
      [...depth, i + 1],
    )}
    {#if example.editOrder}
      <!-- Create Bellow -->
      {#if sibling !== null && editing?.id === sibling.id && typeof editing?.bellow === "string"}
        <tr>
          <td colspan="2">
            <textarea name="{tableId}-bellow" bind:value={editing.bellow}
            ></textarea>
            <br />
            <button
              onpointerdown={() => {
                createNewItem(editing?.bellow || "", sibling.parent, {
                  bellow: sibling.id,
                });
              }}>Save</button
            >
            <button
              onpointerdown={() => {
                editing = {
                  id: sibling.id,
                };
              }}>Cancel</button
            >
          </td>
        </tr>
      {/if}
    {/if}
  {/each}
{/snippet}
<div style="display:flex;flex-wrap:wrap;gap:1ch">
  {#if typeof example.position === "number"}
    <div class="curve">
      <Curve
        participants={example.participants.length}
        position={example.position || 1}
        orientation={$curveOrientation}
        profit={example.profit}
        onPositionChange={(position) => {
          if (example && example.position !== position) {
            example.position = position;
            example = { ...example };
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
  <div style="overflow-x:auto">
    <table>
      <thead>
        <tr>
          {#if example.showOrder}
            <th>
              <IconOrder />
              Order
            </th>
            <th>
              <IconParticipants />
              Participants
            </th>
          {/if}
          {#if example.showSize}
            <th>
              <div class="thWithInp">
                {#if !example.showOrder}
                  <label>
                    <input
                      bind:checked={showInputNrOfParticipants}
                      type="checkbox"
                      name="{tableId}-show-nr-participants"
                      title="Edit number of participants"
                    />{#if !showInputNrOfParticipants}
                      <span title="Participants" style="font-weight: normal;">
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
                        value={example.participants.length}
                        oninput={(e) => {
                          let value = +e.currentTarget.value;
                          if (value > 1000) {
                            value = 1000;
                            e.currentTarget.value = "" + value;
                          }
                          example.participants = Array(value).fill(null);
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
            </th>
            <th>
              <div class="thWithInp">
                <label>
                  <input
                    bind:checked={showInputProfit}
                    type="checkbox"
                    name="{tableId}-show-edit-profit"
                    title="Edit profit"
                  />{#if !showInputProfit}
                    <span title="Profit" style="font-weight:normal">
                      {example.profit}
                    </span>
                  {/if}
                </label>
                {#if showInputProfit}
                  <label>
                    <input
                      name="{tableId}-profit"
                      class="profit"
                      min="0"
                      type="number"
                      value={example.profit}
                      oninput={(e) => {
                        example.profit = +e.currentTarget.value;
                        example = { ...example };
                      }}
                      style="width:8ch"
                      title="Profit"
                    />
                  </label>
                {/if}
                <span>
                  <IconShare />
                  Shares
                </span>
              </div>
            </th>
          {/if}
          <th> Reference Point </th>
        </tr>
      </thead>
      <tbody>
        {#if siblings.length}
          {@render trs(siblings, example.profit)}
        {:else if example.editOrder}
          <tr>
            <td
              colspan={example.showSize && example.showOrder ? 4 : 2}
              style="padding:0.5ch"
            >
              <textarea name="{tableId}-start"></textarea>
              <br />
              <button
                type="button"
                onpointerdown={(e) => {
                  const textareaValue =
                    (
                      e.currentTarget
                        .closest("td")
                        ?.querySelector(
                          `[name="${tableId}-start"]`,
                        ) as HTMLTextAreaElement | null
                    )?.value || "";
                  createNewItem(textareaValue, 0);
                }}>Save</button
              >
              <button
                type="button"
                onpointerdown={() => {
                  example = {
                    ...example,
                    participants: [...initialParticipants],
                  };
                  editing = null;
                }}>Reset</button
              >
            </td>
          </tr>
        {/if}
      </tbody>
    </table>
  </div>
</div>

<style>
  input[type="checkbox"] {
    margin-left: 0;
    margin-top: 0;
    margin-bottom: 0;
  }
  .flex {
    display: flex;
    flex-wrap: wrap;
  }
  .full {
    flex-basis: 100%;
  }
  .edit {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 0.25em;

    & > div {
      display: flex;
      flex-direction: column;
      gap: 0.25em;
    }
  }
  .indent {
    color: gray;
    line-height: 0;
    display: inline-flex;
    padding: 0 0.5ch;
    gap: 1ch;

    &:empty {
      display: none;
    }
  }
  input.profit {
    width: 8ch;
  }
  button {
    font-size: small;
  }
  .participant {
    display: flex;
    align-items: center;
  }
  input.share {
    display: none;

    &:checked + span {
      text-decoration: underline;
    }
  }
  .thWithInp {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.125ch;
  }
</style>
