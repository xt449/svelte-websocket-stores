<!--
    @component
    Websocket Stores:
    - `${id}.press`: boolean
    - `${id}.hold`: boolean
    - `${id}.tap`: boolean
-->

<script lang="ts">
    import { booleans } from "$lib/sws/store";

	let clazz: string = "";
	export { clazz as class }

	export let id: string;

	let pressStore = booleans.get(`${id}.press`);
	let holdStore = booleans.get(`${id}.hold`);
	let tapStore = booleans.get(`${id}.tap`);
	
	let timeout: NodeJS.Timeout | undefined;

	function press() {
		pressStore?.set(true);
		timeout = setTimeout(() => {
			timeout = undefined;
			holdStore?.set(true);
		}, 1_000);
	}

	function release() {
		pressStore?.set(false);
		clearTimeout(timeout);

		if(timeout) {
			timeout = undefined;

			tapStore?.set(true);
			tapStore?.set(false);
		} else {
			holdStore?.set(false);
		}
	}
</script>

<button class={clazz} class:active={$pressStore} on:pointerdown={press} on:pointerup={release} on:pointerout={release}>
	<slot></slot>
</button>
