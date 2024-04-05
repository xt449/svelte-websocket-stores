<!--
	@component
	Websocket Stores:
	- `${id}.press`: boolean
-->

<script lang="ts">
	import { booleans } from "$lib/sws/store";

	let clazz: string = "";
	export { clazz as class };

	export let id: string;

	let pressStore = booleans.get(`${id}.press`);

	function press() {
		$pressStore = true;
	}

	function release() {
		$pressStore = false;
	}
</script>

<button class={clazz} class:active={$pressStore} on:pointerdown={press} on:pointerup={release} on:pointerout={release}>
	<slot></slot>
</button>
