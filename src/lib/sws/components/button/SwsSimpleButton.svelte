<script lang="ts">
    import { booleans } from "$lib/sws/store";

    export let id: string;
    export let value: boolean = true;

    let state = booleans.get(id);
</script>

<button class:active={$state} on:pointerdown={() => $state = value}>
    <slot></slot>
</button>
