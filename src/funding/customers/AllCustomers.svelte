<script lang="ts">
    import {
        onSnapshot,
        query,
        collection,
        orderBy,
        limit,
    } from "firebase/firestore";
    import { db } from "../../firebase";
    import { allCustomers, jsonParse } from "..";
    import type { LoggerMessage } from "../../logger";
    import type { Snippet } from "svelte";
    import type { Distribution } from "../../sustainableDistribution";
    import { customersToBackers, getBackers } from "../../project/backers";
    import { initMRP, mrp } from "../../project";

    const {
        customers,
    }: { customers: Snippet<[Distribution["participants"]]> } = $props();

    let logger: LoggerMessage[] = $state([]);

    $effect(() => {
        db &&
            onSnapshot(
                query(
                    collection(db, "customers"),
                    orderBy("timestamp", "asc"),
                    limit(20),
                ),
                (snapshot) => {
                    $allCustomers = snapshot.docs.map(
                        (doc) => doc.data() as Customer,
                    );
                },
                (error) => {
                    logger = [
                        {
                            message: `Failed to fetch pledges: ${error.message}`,
                            type: "error",
                        },
                        ...logger,
                    ];
                },
            );
    });
</script>

<!-- {@render customers($allCustomers || [])} -->
{@render customers(
    getBackers([
        {
            pledge: $mrp,
            nrOfPeople: 1,
            timestamp: initMRP.timestamp,
        },
        ...customersToBackers($allCustomers || []),
    ]),
)}
