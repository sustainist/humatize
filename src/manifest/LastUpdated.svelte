<script lang="ts">
    import { onMount } from "svelte";
    const link = `https://github.com/sustainist/humatize/commits/main/src/HumatizeManifest.svx`;
    const commit = `https://api.github.com/repos/sustainist/humatize/commits?path=src/HumatizeManifest.svx&page=1&per_page=1`;

    let date = $state("");
    let errMsg = $state("");

    function fetchLastUpdated() {
        fetch(commit)
            .then((result) => {
                if (!result.ok) return;

                return result.json().then((data) => {
                    const item = data?.[0];
                    if (!item) return;

                    date = item.commit.author.date;
                });
            })
            .catch((error) => {
                errMsg = error.message;
            })
            .finally(() => {
                if (!date && !errMsg) {
                    errMsg = "Unable to fetch the last updated date.";
                }
            });
    }

    onMount(() => {
        fetchLastUpdated();
    });
</script>

<p class="last-updated">
    Last updated:
    {#if date}
        <a href={link}>
            <time datetime={date}>
                {new Date(date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                })}
            </time>
        </a>
    {:else if errMsg}
        <small style:color="red"
            >{errMsg}
            <button
                id="last-updated-retry-button"
                type="button"
                onpointerdown={(e) => {
                    e.currentTarget.disabled = true;
                    setTimeout(() => {
                        const button = document.querySelector(
                            "#last-updated-retry-button",
                        ) as HTMLButtonElement | null;
                        if (button) {
                            button.disabled = false;
                        }
                    }, 1000);
                    fetchLastUpdated();
                }}>Retry</button
            ></small
        >
    {/if}
</p>

<style>
    .last-updated {
        font-size: larger;
    }
</style>
