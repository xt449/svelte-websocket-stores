<script lang="ts">
    import { booleans } from "../lib/websocket/store";

    export let id: string;
    export let label: string;

    let value = booleans.get(`${id}.value`);
</script>

<label for={id}>{label}</label>
<input {id} type="checkbox" bind:checked={$value} />
