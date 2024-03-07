<script lang="ts">
	import { strings } from "$lib/websocket/store";

	export let id: string;

	// Format: String
	let value = strings.get(`${id}.value`);
</script>

<input {id} type="text" bind:value={$value} />
