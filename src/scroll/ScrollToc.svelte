<script lang="ts">
  import { onMount } from "svelte";
  import GlobalStyle from "./GlobalStyle.svelte";

  function isTocInViewport(el?: HTMLElement | null) {
    if (!el) return false;

    const rect = el.getBoundingClientRect();
    const windowHeight =
      window.innerHeight || document.documentElement.clientHeight;
    const windowWidth =
      window.innerWidth || document.documentElement.clientWidth;

    return !(
      rect.top >= -30 &&
      rect.left >= 0 &&
      rect.bottom <= windowHeight + 30 &&
      rect.right <= windowWidth
    );
  }

  const onScrollWindow = () => {
    showScrollToc = isTocInViewport(
      <HTMLElement | null>document.querySelector("#app>nav.toc>:first-child"),
    );
  };

  const triggerOnScrollWindow = () => {
    window.dispatchEvent(new Event("scroll"));
  };

  let showScrollToc = $state(false);

  onMount(() => {
    window.addEventListener("scroll", onScrollWindow);
    document
      .querySelector("#app>nav.toc")
      ?.addEventListener("scroll", triggerOnScrollWindow);

    return () => {
      window.removeEventListener("scroll", onScrollWindow);
      document
        .querySelector("#app>nav.toc")
        ?.removeEventListener("scroll", triggerOnScrollWindow);
    };
  });
</script>

<GlobalStyle />

{#if showScrollToc}
  <div class="button-scroll toc">
    <button
      title="Jump to the top of the table of contents"
      type="button"
      onpointerdown={() => {
        document
          .querySelector("#app>nav.toc>:first-child")
          ?.scrollIntoView({ block: "start" });
      }}
    >
      <span class="symbol">&#x203A;</span>
    </button>
  </div>
{/if}

<style>
  .toc {
    right: 4ch;
  }
</style>
