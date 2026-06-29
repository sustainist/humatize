<script lang="ts">
    let {
        email = $bindable(),
    }: {
        email: string;
    } = $props();
</script>

<div class="input-group">
    <label>
        <input
            type="email"
            title="Email for managing your investments"
            placeholder="Email address"
            required
            bind:value={email}
        />
    </label>
</div>
