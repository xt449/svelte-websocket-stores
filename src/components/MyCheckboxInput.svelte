<script lang="ts">
    import { booleans } from "../lib/websocket/store";

    export let id: string;

    let value = booleans.get(`${id}.value`);
</script>

<input {id} type="checkbox" bind:checked={$value} />
