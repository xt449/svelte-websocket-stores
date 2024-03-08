<script lang="ts">
	import { strings } from "$lib/sws/store";

	export let id: string;

	// Format: String
	let value = strings.get(id);
</script>

<input {id} type="text" bind:value={$value} />
