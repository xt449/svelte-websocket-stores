<script lang="ts">
	import { strings } from "$lib/websocket/store";

	export let id: string;

	// Format: "YYYY-MM-DDThh:mm"
	let value = strings.get(`${id}.value`);
</script>

<input {id} type="datetime-local" bind:value={$value} />
