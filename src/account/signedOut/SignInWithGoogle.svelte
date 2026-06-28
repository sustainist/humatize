<script lang="ts">
  import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
  import { auth, logger } from "../../firebase";

  const handleSignInWithPopupGoogle = () => {
    $logger = [];

    if (!auth) {
      $logger = [
        { message: "Authentication not initialized", type: "error" },
        ...$logger,
      ];
      return;
    }

    const provider = new GoogleAuthProvider();

    signInWithPopup(auth, provider).catch((error) => {
      $logger = [
        {
          message: "Error signing in with Google. Try another method.",
          type: "error",
        },
        ...$logger,
      ];
    });
  };
</script>

<form>
  <div>
    <button type="button" onpointerdown={handleSignInWithPopupGoogle}
      >Sign in with Google</button
    >
  </div>
</form>
