<script lang="ts">
	import { strings } from "$lib/sws/store";

	export let id: string;

	// Format: "yyyy-mm-dd"
	let value = strings.get(id);
</script>

<input {id} type="date" bind:value={$value} />
