<script lang="ts">
    import { booleans } from "$lib/sws/store";

    export let id: string;

    let state = booleans.get(id);

    function toggle() {
        $state = !$state;
    }
</script>

<button on:click={toggle}>
    {#if $state}
        <slot name="true" />
    {:else}
        <slot name="false" />
    {/if}
</button>

<style>
    button {
        background: none;
    }
</style>