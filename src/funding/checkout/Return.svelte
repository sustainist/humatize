<script lang="ts">
  import { httpsCallable } from "firebase/functions";
  import { functions, user } from "../../firebase";
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";
  import type { LoggerMessage } from "../../logger";
  import Logger from "../../logger/Logger.svelte";
  import { formId } from "../cart";

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
                  "Thank you for your contribution. " +
                  ($user?.email
                    ? ""
                    : "To manage your contributions please sign in."),
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
          setTimeout(() => {
            document.getElementById($formId)?.scrollIntoView();
          }, 1500);
        });
  });
</script>

<div transition:slide>
  <Logger bind:logger />
</div>
