<script lang="ts">
  import { sendSignInLinkToEmail } from "firebase/auth";
  import { auth, logger, signInWith } from "../../firebase";
  import { slide } from "svelte/transition";

  const handleSign = (
    e: SubmitEvent & {
      currentTarget: EventTarget & HTMLFormElement;
    },
  ) => {
    e.preventDefault();

    $logger = [];

    if (!auth) {
      $logger = [
        { message: "Authentication not initialized", type: "error" },
        ...$logger,
      ];
      return;
    }

    const currentTarget = e.currentTarget;
    const send = currentTarget.send;
    send.disabled = true;
    const email = currentTarget.email.value;

    sendSignInLinkToEmail(auth, email, {
      url: location.origin,
      handleCodeInApp: true,
    })
      .then(() => {
        $signInWith = "none";
        window.localStorage.setItem("sign in with link email", email);

        $logger = [
          {
            message: `To sign in open the link sent to ${email}.`,
            type: "info",
          },
          ...$logger,
        ];
      })
      .catch((error) => {
        $logger = [{ message: error.message, type: "error" }, ...$logger];
      })
      .finally(() => {
        send.disabled = false;
      });
  };
</script>

<form transition:slide onsubmit={handleSign}>
  <div>
    <label>
      <input type="email" placeholder="Email" name="email" /> - email address</label
    >
  </div>
  <div>
    <button class="btn-primary" type="submit" name="send">Send Sign In Link</button>
  </div>
</form>
