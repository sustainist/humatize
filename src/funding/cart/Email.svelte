<script lang="ts">
    let {
        email = $bindable(),
    }: {
        email: string;
    } = $props();
</script>

<label>
    <input
        type="email"
        title="Email for managing your contributions"
        placeholder="Email for managing your contributions"
        required
        bind:value={email}
    />
</label>
