<!--
    @component
    Websocket Stores:
    - `${id}.count`: number - Number of elements
    - `${id}.selected`: number - Selected element index (index starts at 0)
    - `${id}.visibles[${index}]`: boolean - Visibility for each element (index starts at 0)
    - `${id}.labels[${index}]`: string - Label for each element (index starts at 0)
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

    let visibles: Readable<boolean[]>;
    let labels: Readable<string[]>;

    $: {
        console.warn("!!! Recalculating array stores !!!");
        visibles = derived(Array.from(Array($count).keys(), (i) => booleans.get(`${id}.visibles[${i}]`)), value => value);
        labels = derived(Array.from(Array($count).keys(), (i) => strings.get(`${id}.labels[${i}]`)), value => value);
    }

    // DEBUG
    // $count = 3;
    // $selected = 1;
	// $visible = "0,1,2";
</script>

<span class={clazz}>
    {#each { length: $count } as _, index}
        {#if $visibles[index]}
            <button class={memberClass} class:selected={$selected == index} on:click={() => $selected = index}>{$labels[index]}</button>
        {/if}
    {/each}
</span>
