<script lang="ts">
  import { onMount } from "svelte";
  import GlobalStyle from "./GlobalStyle.svelte";

  function isPageTop() {
    return (
      document.body.scrollTop > 30 || document.documentElement.scrollTop > 30
    );
  }

  const onScrollWindow = () => {
    showScrollTop = isPageTop();
  };

  let showScrollTop = $state(false);

  onMount(() => {
    window.addEventListener("scroll", onScrollWindow);

    return () => {
      window.removeEventListener("scroll", onScrollWindow);
    };
  });
</script>

<GlobalStyle />

{#if showScrollTop}
  <div class="button-scroll top">
    <button
      title="Jump to the top of the page"
      type="button"
      onpointerdown={() => {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
      }}
    >
      <span class="symbol">&#xbb;</span>
    </button>
  </div>
{/if}

<style>
  .top {
    right: 1ch;
  }
</style>
