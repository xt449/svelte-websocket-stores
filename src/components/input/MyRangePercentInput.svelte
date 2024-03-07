<script lang="ts">
	import { ANALOG_MAX } from "$lib/crestron";
	import { numbers } from "$lib/websocket/store";

	export let id: string;

	// Format: Number
	let value = numbers.get(`${id}.value`);
</script>

<input {id} type="range" min="0" max={ANALOG_MAX} bind:value={$value} />
