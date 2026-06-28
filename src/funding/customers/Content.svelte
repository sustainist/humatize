<script lang="ts">
    import { httpsCallable } from "firebase/functions";
    import { slide } from "svelte/transition";
    import { customers, formatCurrency, formatDate } from "..";
    import Loading from "../../Loading.svelte";
    import { db, functions, user } from "../../firebase";
    import {
        collection,
        onSnapshot,
        orderBy,
        query,
        where,
    } from "firebase/firestore";
    import type { LoggerMessage } from "../../logger";
    import Logger from "../../logger/Logger.svelte";
    import { showYourContributions } from ".";

    const handleCancelSubscription = (id: string) => {
        loadingCancelSubscription = true;
        if (!id) {
            logger = [
                { message: "Subscription id is required", type: "error" },
                ...logger,
            ];
            return;
        }
        functions &&
            httpsCallable(
                functions,
                "cancelSubscription",
            )({
                id,
            })
                .then((result) => {
                    canceledSubscription = result.data as {
                        id: string;
                        canceled_at: number;
                    };
                    logger = [
                        {
                            message:
                                "Your monthly contribution was successfully canceled.",
                            type: "info",
                        },
                        ...logger,
                    ];
                })
                .catch((error) => {
                    logger = [
                        {
                            message: `Cancel subscription failed: ${error.message}`,
                            type: "error",
                        },
                        ...logger,
                    ];
                })
                .finally(() => {
                    loadingCancelSubscription = false;
                });
    };

    let loadingCustomers = $state(false);
    let logger: LoggerMessage[] = $state([]);
    let loadingCancelSubscription = $state(false);
    let activeSubscriptions = $state<Customer["id"][]>([]);
    let canceledSubscription = $state<{
        id: string;
        canceled_at: number;
    } | null>(null);

    let unsubscribeOnSnapshotCustomers = () => {};
    $effect(() => {
        if ($user?.email) {
            if ($customers === null) {
                db &&
                    (unsubscribeOnSnapshotCustomers = onSnapshot(
                        query(
                            collection(db, "customers"),
                            where("email", "==", $user.email),
                            orderBy("timestamp", "desc"),
                        ),
                        (snapshot) => {
                            $customers = snapshot.docs.map(
                                (doc) => doc.data() as Customer,
                            );
                        },
                        (error) => {
                            logger = [
                                {
                                    message: `Failed to fetch your contributions: ${error.message}`,
                                    type: "error",
                                },
                                ...logger,
                            ];
                        },
                    ));
            }
        } else {
            unsubscribeOnSnapshotCustomers();
            $customers = null;
        }
    });
</script>

{#snippet level(items: Heading[], selectedId: string)}
    {#each items as { id, text = '', index = [], children = [], line = 0 } (id)}
        <option value={JSON.stringify([id, line])}
            >{@html Array(index.length)
                .fill("&nbsp;&nbsp;&nbsp;&nbsp;")
                .join("")}{text.length > 40
                ? text.substring(0, 40) + "..."
                : text}</option
        >
        {@render level(children, selectedId)}
    {/each}
{/snippet}
<div style:overflow="auto hidden">
    <Logger bind:logger />
    <table>
        <caption>
            <label>
                <input type="checkbox" bind:checked={$showYourContributions} />
                Your Contributions
            </label>
        </caption>
        <thead>
            <tr>
                <th>Purpose</th>
                <th>Amount</th>
                <th>Recurring</th>
            </tr>
        </thead>
        <tbody>
            {#if $customers}
                {#each $customers as customer (customer.id)}
                    <tr>
                        <td>
                            <div class="purpose">
                                {customer.purpose}
                            </div>
                        </td>
                        {#if customer.interval === "one-time"}
                            <td>
                                <div class="spaced">
                                    <span>
                                        {formatCurrency(customer.currency)
                                            .currency}:
                                    </span>
                                    <b>
                                        {(customer?.amount || 0) / 100}
                                    </b>
                                </div>
                            </td>
                            <td>
                                <div>
                                    <span>
                                        {formatDate(customer.created * 1000)}
                                    </span>
                                    <span>(One-time)</span>
                                </div>
                            </td>
                        {:else}
                            <td>
                                <div class="spaced">
                                    <span>
                                        {formatCurrency(customer.currency)
                                            .currency}:
                                    </span>
                                    <b>
                                        {(customer.amount || 0) / 100}
                                    </b>
                                </div>
                            </td>
                            <td>
                                <div>
                                    <span>
                                        {formatDate(customer.created * 1000)}
                                    </span>
                                    {#if typeof customer.canceled_at === "number"}
                                        <span>-</span>
                                        <span>
                                            {formatDate(
                                                customer.canceled_at * 1000,
                                            )}
                                        </span>
                                        <span>(Monthly Canceled)</span>
                                    {:else if canceledSubscription?.id === customer.id && canceledSubscription?.canceled_at}
                                        <span>-</span>
                                        <span>
                                            {formatDate(
                                                canceledSubscription.canceled_at *
                                                    1000,
                                            )}
                                        </span>
                                        <span>(Monthly Canceled)</span>
                                    {:else}
                                        <span>
                                            (<label>
                                                <input
                                                    name="toggle-cancel-subscription-button"
                                                    type="checkbox"
                                                    value={customer.id}
                                                    checked={!activeSubscriptions.includes(
                                                        customer.id,
                                                    )}
                                                    onchange={(e) => {
                                                        if (
                                                            e.currentTarget
                                                                .checked
                                                        ) {
                                                            activeSubscriptions =
                                                                activeSubscriptions.filter(
                                                                    (id) =>
                                                                        id !==
                                                                        customer.id,
                                                                );
                                                        } else {
                                                            activeSubscriptions =
                                                                [
                                                                    ...activeSubscriptions,
                                                                    customer.id,
                                                                ];
                                                        }
                                                    }}
                                                />Monthly</label
                                            >)
                                        </span>
                                        {#if activeSubscriptions.includes(customer.id)}
                                            <form transition:slide>
                                                <button
                                                    disabled={loadingCancelSubscription}
                                                    onclick={(e) => {
                                                        if (
                                                            confirm(
                                                                "If you are sure you want to cancel your monthly contribution, press OK.",
                                                            )
                                                        ) {
                                                            handleCancelSubscription(
                                                                customer.id,
                                                            );
                                                        }
                                                    }}
                                                >
                                                    Cancel Monthly Contribution{#if loadingCancelSubscription}<Loading
                                                            delay={0}
                                                            text=""
                                                        />{/if}
                                                </button>
                                            </form>
                                        {/if}
                                    {/if}
                                </div>
                            </td>
                        {/if}
                    </tr>
                {:else}
                    <tr>
                        <td colspan="3">You have made no contributions yet</td>
                    </tr>
                {/each}
            {:else if loadingCustomers}
                <tr>
                    <td colspan="3">
                        <Loading text="Loading your contributions" />
                    </td>
                </tr>
            {:else if !$user?.email}
                <tr>
                    <td colspan="3"
                        >To see your contributions please sign in</td
                    >
                </tr>
            {/if}
        </tbody>
    </table>
</div>

<style>
    input {
        vertical-align: middle;
        &[name="toggle-cancel-subscription-button"] {
            margin-left: 0;
            vertical-align: baseline;
        }
    }
    td:empty {
        display: none;
    }
    .spaced {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1ch;
    }
    .purpose {
        max-width: 42ch;
    }
</style>
