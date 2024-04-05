<!--
	@component
	Websocket Stores:
	- `${id}.state`: boolean
-->

<script lang="ts">
	import { booleans } from "$lib/sws/store";

	let clazz: string = "";
	export { clazz as class }
	
	export let id: string;

	let state = booleans.get(`${id}.state`);

	function toggle() {
		$state = !$state;
	}
</script>

<button class={clazz} on:click={toggle}>
	{#if $state}
		<slot name="true" />
	{:else}
		<slot name="false" />
	{/if}
</button>
