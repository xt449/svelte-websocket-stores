<script lang="ts">
	import { ANALOG_MAX } from "$lib/crestron";
	import { numbers } from "$lib/sws/store";

	export let id: string;

	// Format: Number
	let value = numbers.get(id);
</script>

<input {id} type="range" min="0" max={ANALOG_MAX} bind:value={$value} />
