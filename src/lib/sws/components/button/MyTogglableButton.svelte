<script lang="ts">
    import { booleans } from "$lib/sws/store";

    export let id: string;

    let state = booleans.get(id);

    function toggle() {
        $state = !$state;
    }
</script>

<button class:active={$state} on:click={toggle}>
    <slot></slot>
</button>
