<script>
    import { showBackThisProjectContent, showFormCheckout } from ".";
</script>

<button
    class="btn-support-sticky"
    onpointerdown={() => {
        $showBackThisProjectContent = !$showBackThisProjectContent;
        $showFormCheckout = null;
    }}
>
    {#if $showBackThisProjectContent}
        <i class="fa-solid fa-xmark"></i>
    {:else}
        <i class="fas fa-arrow-right"></i>
    {/if}
    &nbsp; Back this project
</button>
