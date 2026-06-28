<script lang="ts">
    let {
        purpose = $bindable(),
    }: {
        purpose: string;
    } = $props();
</script>

<textarea bind:value={purpose}></textarea>
