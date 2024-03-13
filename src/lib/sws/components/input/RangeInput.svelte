<script lang="ts">
	import { numbers } from "$lib/sws/store";

	export let id: string;

	export let min: number, max: number;

	// Format: Number
	let value = numbers.get(id);
</script>

<input {id} type="range" {min} {max} bind:value={$value} />
