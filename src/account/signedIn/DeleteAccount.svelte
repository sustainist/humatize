<script lang="ts">
  import {
    EmailAuthProvider,
    GoogleAuthProvider,
    reauthenticateWithCredential,
    reauthenticateWithPopup,
    sendSignInLinkToEmail,
    signOut,
  } from "firebase/auth";
  import { httpsCallable } from "firebase/functions";
  import { auth, functions, logger, user } from "../../firebase";
  import Loading from "../../Loading.svelte";

  let isDeleting = $state(false);

  const handleDeleteVendorAccount = (
    e: SubmitEvent & {
      currentTarget: EventTarget & HTMLFormElement;
    },
  ) => {
    e.preventDefault();
    isDeleting = true;

    if (!$user) {
      $logger = [{ message: "User not found", type: "error" }, ...$logger];
      return;
    }

    if (!confirm("Are you sure you want to delete your account?"))
      return (isDeleting = false);

    reauthenticateWithPopup($user, new GoogleAuthProvider()).then(
      (userCredential) => {
        return (
          functions &&
          httpsCallable(functions, "deleteAccount")()
            .then(() => {
              auth && signOut(auth);
              $logger = [
                {
                  message: "Your account was successfully deleted.",
                  type: "info",
                },
                ...$logger,
              ];
            })
            .catch((error) => {
              $logger = [{ message: error.message, type: "error" }, ...$logger];
            })
            .finally(() => {
              isDeleting = false;
            })
        );
      },
    );
  };

  const handleDeleteLinkAccount = (
    e: SubmitEvent & {
      currentTarget: EventTarget & HTMLFormElement;
    },
  ) => {
    e.preventDefault();
    isDeleting = true;

    if (!$user?.email) {
      $logger = [{ message: "User not found", type: "error" }, ...$logger];
      return;
    }

    auth &&
      sendSignInLinkToEmail(auth, $user.email, {
        url: location.origin + "?delete_account",
        handleCodeInApp: true,
      })
        .then(() => {
          window.localStorage.setItem(
            "sign in with link email",
            $user.email || "",
          );

          $logger = [
            {
              message:
                "A link was sent to your email address. Open the link to delete your account.",
              type: "info",
            },
            ...$logger,
          ];
        })
        .catch((error) => {
          $logger = [{ message: error.message, type: "error" }, ...$logger];
        })
        .finally(() => {
          isDeleting = false;
        });
  };

  const handleDeleteEmailAccount = (
    e: SubmitEvent & {
      currentTarget: EventTarget & HTMLFormElement;
    },
  ) => {
    e.preventDefault();
    const form = e.currentTarget;
    isDeleting = true;

    if (!$user) {
      $logger = [{ message: "User not found", type: "error" }, ...$logger];
      return;
    }
    if (!confirm("Are you sure you want to delete your account?"))
      return (isDeleting = false);

    return reauthenticateWithCredential(
      $user,
      EmailAuthProvider.credential($user.email as string, form.password.value),
    )
      .then((userCredential) => {
        return functions && httpsCallable(functions, "deleteAccount")();
      })
      .then(() => {
        auth && signOut(auth);
        $logger = [
          { message: "Your account was successfully deleted.", type: "info" },
          ...$logger,
        ];
      })
      .catch((error) => {
        $logger = [{ message: error.message, type: "error" }, ...$logger];
      })
      .finally(() => {
        isDeleting = false;
      });
  };

  const handleDelete = (
    e: SubmitEvent & {
      currentTarget: EventTarget & HTMLFormElement;
    },
  ) => {
    e.preventDefault();

    const form = e.currentTarget;

    $logger = [];

    if (form.type.value === "email-link") {
      handleDeleteLinkAccount(e);
    } else if (form.type.value === "email-and-password") {
      handleDeleteEmailAccount(e);
    } else if (form.type.value === "provider-google") {
      handleDeleteVendorAccount(e);
    } else {
      $logger = [{ message: "Unknown delete type", type: "error" }, ...$logger];
    }
  };

  let agree = $state(false);
</script>

{#snippet deleteMessage(email: string | null)}
  <div style:word-wrap="break-word">
    Delete account with its associated data
  </div>
{/snippet}

<div>
  <form onsubmit={handleDelete}>
    {#if $user?.email}
      <h5>
        <label>
          <input
            name="delete-account-agree"
            bind:checked={agree}
            type="checkbox"
          /> Delete account
        </label>
      </h5>
    {/if}
    {#if agree && $user?.providerData[0].providerId === "password"}
      {#if localStorage.getItem("signed in with link")}
        {@render deleteMessage($user.email)}
        <div>
          <input type="hidden" name="type" value="email-link" />
          <button disabled={isDeleting} type="submit" name="go"
            >{#if isDeleting}<Loading
                delay={0}
                text="Sending link"
              />{:else}Send delete account link{/if}</button
          >
          -&gt; {$user.email}
        </div>
      {:else}
        {@render deleteMessage($user.email)}
        <div>
          <label>
            <input type="password" name="password" placeholder="password" />
          </label>
          <input type="hidden" name="type" value="email-and-password" />
          <button disabled={isDeleting} type="submit" name="go"
            >{#if isDeleting}<Loading
                delay={0}
                text="Deleting account"
              />{:else}Delete account{/if}</button
          >
        </div>
      {/if}
    {:else if agree && $user?.providerData[0].providerId === "google.com"}
      {@render deleteMessage($user.email)}
      <div>
        <input type="hidden" name="type" value="provider-google" />
        <button disabled={isDeleting} type="submit" name="go"
          >{#if isDeleting}<Loading
              delay={0}
              text="Deleting account"
            />{:else}Delete account{/if}</button
        >
      </div>
    {/if}
  </form>
</div>
