<script lang="ts">
    /**
     * @deprecated
     */

    import { numbers } from "$lib/sws/store";

    export let id: string;
    export let check1: (value: number) => boolean;
    export let check2: (value: number) => boolean;
    export let check3: (value: number) => boolean;

    let state = numbers.get(id);
</script>

{#if check1($state)}
    <slot name="0" />
{:else if check2($state)}
    <slot name="1" />
{:else if check3($state)}
    <slot name="2" />
{/if}
