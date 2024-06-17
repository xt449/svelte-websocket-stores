<!--
	@component
	Websocket Stores:
	- `${id}.count`: number - Number of elements
	- `${id}.selected`: number - Selected element index (starts at 1; 0 for none)
	- `${id}[${index}].visible`: boolean - Visibility for each element (index starts at 0)
	- `${id}[${index}].label`: string - Label for each element (index starts at 0)
-->

<script lang="ts">
	import { booleans, numbers, strings } from "$lib/sws/store";
	import { derived, type Readable } from "svelte/store";

	let clazz: string = "";
	export { clazz as class };

	export let memberClass: string = "";

	export let id: string;

	let count = numbers.get(`${id}.count`);
	/**
	 * None = 0,
	 * Index 0 = 1,
	 * Index 1 = 2,
	 * ...
	 */
	let selected = numbers.get(`${id}.selected`);

	let visibleArray: Readable<boolean[]>;
	let labelArray: Readable<string[]>;

	$: {
		console.warn("!!! Recalculating array stores !!!");
		visibleArray = derived(Array.from(Array($count).keys(), (i) => booleans.get(`${id}[${i}].visible`)), value => value);
		labelArray = derived(Array.from(Array($count).keys(), (i) => strings.get(`${id}[${i}].label`)), value => value);
	}
</script>

<span class={clazz}>
	{#each { length: $count } as _, index}
		{#if $visibleArray[index]}
			<button class={memberClass} class:selected={$selected == index + 1} on:click={() => ($selected = index + 1)}>{$labelArray[index]}</button>
		{/if}
	{/each}
</span>
