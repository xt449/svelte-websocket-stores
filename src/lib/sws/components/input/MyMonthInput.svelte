<script lang="ts">
	import { strings } from "$lib/sws/store";

	export let id: string;

	// Format: "yyyy-MM"
	let value = strings.get(id);
</script>

<input {id} type="month" bind:value={$value} />
