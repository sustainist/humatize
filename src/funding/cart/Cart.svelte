<script lang="ts">
    import Amount from "./Amount.svelte";
    import Account from "./Account.svelte";
</script>

<!-- {#if $showCart} -->
<form
    class="input-group"
    onsubmit={(e) => {
        e.preventDefault();
    }}
>
    <!-- <div>
        <h4>Project</h4>
        <Project />
    </div> -->
    <div>
        <h4>Account</h4>
        <Account />
    </div>
    <div>
        <h4>Amount</h4>
        <!-- <Currency /> -->
        <Amount />
    </div>
    <!-- <div>
        <h4>Recurring</h4>
        <Interval />
    </div> -->
    <!--  <div>
                <Pay {formId} />
            </div> -->
</form>
<!-- {:else}
    <div>
        <label>
            <input type="checkbox" bind:checked={$showCart} />
            Make a contribution
        </label>
    </div>
{/if} -->
