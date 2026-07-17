<script lang="ts">
    import { showCart, showFormCheckout } from "..";
    import Interval from "./Interval.svelte";
    import Currency from "./Currency.svelte";
    import Amount from "./Amount.svelte";
    import Pay from "./Pay.svelte";
    import Email from "./Email.svelte";
    import Project from "./Project.svelte";
    import Account from "./Account.svelte";
    import { formId } from ".";
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
