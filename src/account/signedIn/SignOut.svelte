<script lang="ts">
  import { signOut } from "firebase/auth";
  import { auth, logger } from "../../firebase";

  const handleSignOut = () => {
    $logger = [];

    auth &&
      signOut(auth).catch((error) => {
        $logger = [
          { message: "Error signing out.", type: "error" },
          ...$logger,
        ];
        console.error(error.message);
      });
  };
</script>

<div>
  <button class="btn-primary" type="button" onpointerdown={handleSignOut}>Sign Out</button>
</div>
