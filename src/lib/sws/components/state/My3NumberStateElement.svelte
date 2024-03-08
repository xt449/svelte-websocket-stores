<script lang="ts">
    /**
     * @deprecated
     */

    import { numbers } from "$lib/sws/store";

    export let id: string;
    export let value1: number;
    export let value2: number;
    export let value3: number;

    let state = numbers.get(id);
</script>

{#if $state == value1}
    <slot name="state1" />
{:else if $state == value2}
    <slot name="state2" />
{:else if $state == value3}
    <slot name="state3" />
{/if}
