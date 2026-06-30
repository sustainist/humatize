<script lang="ts">
  import { updateProfile } from "firebase/auth";
  import { logger, user } from "../../firebase";

  const handleUpdate = (
    e: SubmitEvent & {
      currentTarget: EventTarget & HTMLFormElement;
    },
  ) => {
    $logger = [];

    if (!$user) {
      $logger = [{ message: "User not found", type: "error" }, ...$logger];
      return;
    }

    e.preventDefault();

    const form = e.currentTarget;

    const displayNameValue = form.displayName.value || "";

    const update = form.update;
    update.disabled = true;

    updateProfile($user, {
      displayName: displayNameValue,
    })
      .then(() => {
        $user = $user;
      })
      .catch(
        (error) =>
          ($logger = [{ message: error.message, type: "error" }, ...$logger]),
      )
      .finally(() => {
        update.disabled = false;
      });
  };
</script>

<div>
  <h5>Name</h5>
  <form onsubmit={handleUpdate}>
    <label style="margin:0.5em 0">
      <input
        disabled={!$user?.email}
        placeholder="Name"
        onfocus={(e) => e.currentTarget.select()}
        type="text"
        value={$user?.displayName || $user?.email || ""}
        title="Name"
        name="displayName"
      />
    </label>
    <button
      class="btn-primary"
      disabled={!$user?.email}
      type="submit"
      name="update">Update name</button
    >
  </form>
</div>
