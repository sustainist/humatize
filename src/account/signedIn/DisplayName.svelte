<script>
    import { user } from "../../firebase";
</script>

<span style:font-weight="normal">
    {#if $user?.email}
        ({#if $user.displayName}
            {$user.displayName}
        {:else}
            {$user.email}
        {/if})
    {/if}
</span>
