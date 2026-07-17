<script lang="ts">
    let {
        showAccountSettings = $bindable(),
    }: { showAccountSettings: boolean } = $props();
</script>

<span class="inline-options" style="width:fit-content">
    <label for="show-account-settings"
        ><input
            id="show-account-settings"
            type="checkbox"
            bind:checked={showAccountSettings}
        /> Show Account Settings</label
    >
</span>
