<script lang="ts">
  import { sendEmailVerification } from "firebase/auth";
  import { logger, user } from "../../firebase";

  const handleSendEmailVerification = (
    e: MouseEvent & {
      currentTarget: EventTarget & HTMLButtonElement;
    },
  ) => {
    $logger = [];

    if (!$user) {
      $logger = [{ message: "User not found", type: "error" }, ...$logger];
      return;
    }
    e.currentTarget.disabled = true;

    window.setTimeout(() => (showRefreshForVerifiedEmail = true), 3000);

    sendEmailVerification($user)
      .then(() => {
        $logger = [
          {
            message: "A verification link was sent to your email address.",
            type: "info",
          },
          ...$logger,
        ];
      })

      .catch(
        (error) =>
          ($logger = [{ message: error.message, type: "error" }, ...$logger]),
      );
  };
  let showRefreshForVerifiedEmail = $state(false);

  let emailVerified = $state($user?.emailVerified);
</script>

<div>
  <h5>Email</h5>
  <form>
    {$user?.email || ""}
    {#if $user?.providerData[0].providerId === "password"}
      {#if !emailVerified}
        <button type="button" onclick={handleSendEmailVerification}
          >Verify</button
        >
        {#if showRefreshForVerifiedEmail}
          <button
            type="button"
            onclick={() =>
              $user?.reload().then(() => {
                $logger = [];
                emailVerified = $user.emailVerified;
                if (!emailVerified) {
                  $logger = [
                    { message: "Email not verified yet!", type: "error" },
                    ...$logger,
                  ];
                }
              })}>Check email verification</button
          >
        {/if}
      {:else}
        <span class="info">&checkmark; verified</span>
      {/if}
    {/if}
  </form>
</div>
