<script lang="ts">
  const { list }: { list?: string } = $props();
</script>

{#snippet level(items: Heading[])}
  {#if items.length}
    <ol class="list">
      {#each items as { id, index, text, children = [] }, i (id || i)}
        {@const indent = (index?.length || 1) - 1}
        <li style="--indent:{indent > 1 ? indent - 1 : 0}">
          {#if text && id}
            <a href="/#{id}">
              <span class="index">
                {index?.join(".")}
              </span>
              <span class="label">
                {text}
              </span>
            </a>
          {/if}
          {@render level(children)}
        </li>
      {/each}
    </ol>
  {/if}
{/snippet}

{#if list}
  {@const toc: Heading[] = JSON.parse(list || "[]")}
  <nav class="toc">
    <div class="inner">
      <h1 class="title">Table of Contents</h1>
      {#if toc.length}
        {@render level(toc)}
      {:else}
        <p><small style:color="red">No headings found</small></p>
      {/if}
    </div>
  </nav>
{:else}
  <p><small style:color="red">Toc list is empty</small></p>
{/if}

<style>
  :global {
    .container-toc-and-content {
      display: grid;
      grid-template-columns: minmax(0, 400px) minmax(0, 1200px);
      gap: 1.25rem;
      margin: 2.5rem 0 3rem;

      nav.toc {
        position: sticky;
        top: 5rem;
      }
    }

    @media (max-width: 1200px) {
      .container-toc-and-content {
        grid-template-columns: 1fr;

        nav.toc {
          position: initial;
        }
      }
    }

    .container-content :is(h1, h2, h3, h4, h5, h6) {
      display: flex;
      align-items: center;

      .content {
        flex: 1;
      }

      .act {
        gap: 0.5rem;
        display: inline-flex;
        flex-wrap: wrap;

        .section-link {
          font-size: 1rem;
          text-decoration: none;
          opacity: 0.75;
          transition: opacity 400ms;

          &::before {
            content: "§";
          }

          &:hover {
            opacity: 1;
          }

          *:hover > .act & {
            text-decoration: underline;
            text-underline-offset: 4px;
          }
        }
      }
    }
  }

  nav.toc {
    .title {
      font-variant: all-small-caps;
      font-weight: bold;
      font-size: x-large;
    }
    .list {
      list-style: none;
      padding-left: 0;
      margin-left: 0;
      line-height: 1.25;

      li {
        li {
          font-size: 0.95em;
        }

        a {
          display: flex;
          text-decoration: none;
          color: inherit;

          .index {
            min-width: 5rem;
          }

          .label {
            margin-left: calc(var(--indent) * 1rem);
            flex: 1;
            /* border-bottom: 1px dashed transparent; */
          }

          /* &:hover .label {
            border-bottom-color: inherit;
          } */
        }
      }

      .inner > & > li {
        margin-top: 1em;

        & > a {
          font-weight: bold;
        }
      }
    }
  }
</style>
