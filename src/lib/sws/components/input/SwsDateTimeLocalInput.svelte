<script lang="ts">
	import { strings } from "$lib/sws/store";

	export let id: string;

	// Format: "YYYY-MM-DDThh:mm"
	let value = strings.get(id);
</script>

<input {id} type="datetime-local" bind:value={$value} />
