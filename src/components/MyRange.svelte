<script lang="ts">
    import { ANALOG_MAX } from "../lib/crestron";
    import { numbers } from "../lib/websocket/store"

    export let id: string;
    export let label: string;

    let value = numbers.get(`${id}.value`);
</script>

<label for={id}>{label}</label>
<input {id} type="range" max={ANALOG_MAX} bind:value={$value} />
