<script lang="ts">
	import { strings } from "$lib/sws/store";

	export let id: string;

	// Format: "hh:mm:ss"
	let value = strings.get(id);
</script>

<input {id} type="time" bind:value={$value} />
