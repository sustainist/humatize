<script lang="ts">
  import { httpsCallable } from "firebase/functions";
  import { functions, user } from "../../firebase";
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";
  import type { LoggerMessage } from "../../logger";
  import Logger from "../../logger/Logger.svelte";
  import { formId } from "../cart";
  import Loading from "../../Loading.svelte";

  let {
    checkoutSessionId = $bindable(),
  }: {
    checkoutSessionId: string | null;
  } = $props();

  let logger: LoggerMessage[] = $state([]);

  onMount(() => {
    functions &&
      httpsCallable(
        functions,
        "sessionStatus",
      )({
        checkoutSessionId,
        email: $user?.email || localStorage.getItem(`email`) || undefined,
      })
        .then(({ data }) => {
          const { status } = data as {
            status: "open" | "complete" | "expired" | null;
            customerEmail: string | null;
          };
          if (status === "open") {
            logger = [
              { message: "Please refresh the page.", type: "error" },
              ...logger,
            ];
          } else {
            logger = [
              {
                message:
                  "Thank you for your pledge. " +
                  ($user?.email
                    ? ""
                    : "You can see it in the Backer section after signing in."),
                type: "info",
                cb: () => {
                  checkoutSessionId = null;
                  history.pushState(
                    null,
                    document.title,
                    window.location.origin + window.location.pathname,
                  );
                },
              },
              ...logger,
            ];
          }
        })
        .catch((error) => {
          logger = [{ message: error.message, type: "error" }, ...logger];
        })
        .finally(() => {
          /* setTimeout(() => {
            document
              .getElementById("session-" + $formId)
              ?.parentElement?.scrollIntoView();
          }, 1500); */
        });
  });
</script>

{#if !logger.length}
  <div style="width:fit-content;margin-left:auto;margin-right:auto">
    <Loading />
  </div>
{:else}
  <div transition:slide style="padding-top:0.125rem;padding-bottom:2.5rem;">
    <div
      class="card"
      style="width:fit-content;margin-left:auto;margin-right:auto;"
    >
      <div id={"session-" + $formId}>
        <Logger bind:logger />
      </div>
    </div>
  </div>
{/if}
