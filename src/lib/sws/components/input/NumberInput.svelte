<script lang="ts">
	import { numbers } from "$lib/sws/store";

	export let id: string;

	// Format: Number
	let value = numbers.get(id);
</script>

<input {id} type="number" bind:value={$value} />
