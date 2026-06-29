<script lang="ts">
    let {
        purpose = $bindable(),
    }: {
        purpose: string;
    } = $props();
</script>

<div>
    <textarea bind:value={purpose}></textarea>
</div>
