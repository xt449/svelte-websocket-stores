<script lang="ts">
	import { strings } from "$lib/websocket/store";

	export let id: string;

	// Format: "yyyy-mm-dd"
	let value = strings.get(`${id}.value`);
</script>

<input {id} type="date" bind:value={$value} />
