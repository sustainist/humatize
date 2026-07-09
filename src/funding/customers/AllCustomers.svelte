<script lang="ts">
    import {
        onSnapshot,
        query,
        collection,
        orderBy,
    } from "firebase/firestore";
    import { db } from "../../firebase";
    import { allCustomers, jsonParse } from "..";
    import type { LoggerMessage } from "../../logger";

    let logger: LoggerMessage[] = $state([]);

    $effect(() => {
        db &&
            onSnapshot(
                query(
                    collection(db, "customers"),
                    orderBy("timestamp", "desc"),
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

<pre>

    {JSON.stringify($allCustomers, null, 2)}

</pre>
