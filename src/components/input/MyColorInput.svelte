<script lang="ts">
	import { strings } from "$lib/websocket/store";

	export let id: string;

	// Format: "#XXXXXX"
	let value = strings.get(`${id}.value`);
</script>

<input {id} type="color" bind:value={$value} />
