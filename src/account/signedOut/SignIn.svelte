<script lang="ts">
  import { signInWith } from "../../firebase";
</script>

<div class="providers">
  {#each [{ value: "google", label: "Sign  in with Google" }, { value: "link", label: "Sign in with Email Link" }, { value: "email", label: "Sign in with Email & Password" }] as { value, label }}
    <label>
      <input
        type="checkbox"
        {value}
        checked={$signInWith === value}
        name="sign-in-with-{value}"
        onchange={(e) => {
          const value = e.currentTarget.value;
          if (value === $signInWith) {
            $signInWith = "none";
            return;
          }
          $signInWith = value as any;
        }}
      />
      {label}
    </label>
  {/each}
</div>

<style>
  .providers {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5ch;
    margin-top: 0.5ch;
  }
</style>
