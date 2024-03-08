<script lang="ts">
    import { booleans } from "$lib/sws/store";

    export let id: string;

	// Format: Boolean
    let value = booleans.get(id);
</script>

<input {id} type="checkbox" bind:checked={$value} />
