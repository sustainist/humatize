<script lang="ts">
    import { showCart, showFormCheckout } from "..";
    import Interval from "./Interval.svelte";
    import Currency from "./Currency.svelte";
    import Amount from "./Amount.svelte";
    import Pay from "./Pay.svelte";
    import Email from "./Email.svelte";
    import Destination from "./Destination.svelte";
    import Account from "./Account.svelte";

    let {
        formId,
        purpose = $bindable(),
        currency = $bindable(),
        amount = $bindable(),
        interval = $bindable(),
        email = $bindable(),
    }: {
        formId: string;
        amount: number;
        currency: { code: string; symbol: string } | null;
        interval: "month" | "one-time";
        email: string;
        purpose: string;
    } = $props();
</script>

<!-- {#if $showCart} -->
<form class="input-group"
    onsubmit={(e) => {
        e.preventDefault();
        $showFormCheckout = $showFormCheckout !== formId ? formId : null;
    }}
    >
    <div>
        <h4>Account</h4>
        <Account bind:email />
    </div>
    <div>
        <h4>Destination</h4>
        <Destination bind:purpose />
    </div>
    <div>
        <h4>Amount</h4>
        <Currency bind:currency {formId} />
        <Amount bind:amount {formId} />
    </div>
    <div>
        <h4>Recurring</h4>
        <Interval bind:interval {formId} />
    </div>
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
