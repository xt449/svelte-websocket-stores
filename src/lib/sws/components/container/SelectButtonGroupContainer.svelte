<!--
    @component
    Websocket Stores:
    - `${id}.count`: number - Number of elements
    - `${id}.selected`: number - Selected element index (index starts at 0)
    - `${id}.visible`: string - Comma separated visible elements by index (index starts at 0)
    - `${id}.labels[${index}]`: string - Labels for each element (index starts at 0)
-->

<script lang="ts">
    import { numbers, strings } from "$lib/sws/store";
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
    let visible = strings.get(`${id}.visible`);
	let visibleArray = derived(visible, (value) => value.split(","));

    let labels: Readable<string[]>;

    $: {
        console.warn("!!! Recalculating labels string array store !!!");
        labels = derived(Array.from(Array($count).keys(), (i) => strings.get(`${id}.labels[${i}]`)), value => value);
    }

    // DEBUG
    // $count = 3;
    // $selected = 1;
	// $visible = "0,1,2";
</script>

<span class={clazz}>
    {#each { length: $count } as _, index}
        {#if $visibleArray.includes(String(index))}
            <button class={memberClass} class:selected={$selected == index} on:click={() => $selected = index}>{$labels[index]}</button>
        {/if}
    {/each}
</span>
