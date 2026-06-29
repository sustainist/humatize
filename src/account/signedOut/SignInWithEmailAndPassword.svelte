<script lang="ts">
  import {
    createUserWithEmailAndPassword,
    RecaptchaVerifier,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
  } from "firebase/auth";
  import Loading from "../../Loading.svelte";
  import { onMount } from "svelte";
  import { auth, logger } from "../../firebase";

  let signLoading = $state(false);
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

    const form = e.currentTarget,
      emailValue = form.email?.value || "",
      passwordValue = form.password?.value || "",
      submit = form.querySelector("button");
    if (submit) {
      signLoading = true;
    }

    recaptchaVerifier
      ?.verify()
      .then(() => {
        if (sign === "Sign Up") {
          return (
            auth &&
            createUserWithEmailAndPassword(
              auth,
              emailValue,
              passwordValue,
            ).catch((error) => {
              $logger = [{ message: error.message, type: "error" }, ...$logger];
            })
          );
        }
        return (
          auth &&
          signInWithEmailAndPassword(auth, emailValue, passwordValue).catch(
            (error) => {
              $logger = [
                { message: "Wrong credentials!", type: "error" },
                ...$logger,
              ];
              setTimeout(() => {
                showResetPassword = true;
              }, 1000);
              console.error(error);
            },
          )
        );
      })
      .catch((error) => {
        $logger = [{ message: error.message, type: "error" }, ...$logger];
      })
      .finally(() => {
        signLoading = false;
      });
  };

  let resetPasswordLoading = $state(false);
  const handleResetPassword = () => {
    resetPasswordLoading = true;
    setTimeout(() => {
      const promptForEmail = prompt(
        "Enter your email address to reset your password",
      );
      if (promptForEmail === null) {
        resetPasswordLoading = false;
        return;
      }

      auth &&
        sendPasswordResetEmail(auth, promptForEmail || "")
          .then(() => {
            $logger = [
              {
                message:
                  "A reset password link was sent to your email address.",
                type: "info",
              },
              ...$logger,
            ];
          })
          .catch((error) => {
            $logger = [
              {
                message:
                  'You cannot reset the password for "' + promptForEmail + '"',
                type: "error",
              },
              ...$logger,
            ];
            console.error(error.message);
          })
          .finally(() => {
            resetPasswordLoading = false;
          });
    }, 10);
  };

  let showResetPassword = $state(false);
  let sign: "Sign In" | "Sign Up" = $state("Sign In");

  let recaptchaVerifier = $state<RecaptchaVerifier>();
  onMount(() => {
    if (auth) {
      recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha");
      recaptchaVerifier.render();
    }
  });
</script>

<form onsubmit={handleSign} class="margin">
  <div>
    <select
      bind:value={sign}
      title="Sign"
      name="sign"
      onchange={(e) => {
        e.currentTarget.parentElement
          ?.querySelectorAll("input")
          .forEach((input) => (input.value = ""));
      }}
    >
      <option value="Sign In">Existing account</option>
      <option value="Sign Up">New account</option>
    </select>
  </div>

  <div class="margin">
    <label
      ><input
        type="email"
        placeholder="Email"
        name="email"
        title="Email"
      /></label
    >
  </div>
  <div class="margin">
    <label
      ><input
        type="password"
        placeholder="Password"
        name="password"
        title="Password"
      /></label
    >
  </div>

  <div>
    <div id="recaptcha"></div>
  </div>
  <div>
    <button class="btn-primary" type="submit" disabled={signLoading}
      >{sign}{#if signLoading}<Loading text="" />{/if}</button
    >
  </div>

  {#if showResetPassword && sign === "Sign In"}
    <div>
      <button
        class="btn-primary"
        type="button"
        onclick={handleResetPassword}
        disabled={resetPasswordLoading}
        >Reset password{#if resetPasswordLoading}<Loading />{/if}</button
      >
    </div>
  {/if}
</form>

<style>
  .margin {
    margin: 0.5em 0;
  }
</style>
