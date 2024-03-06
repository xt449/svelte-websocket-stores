<script lang="ts">
    import { ANALOG_MAX } from "../lib/crestron";

    export let id: string;
    export let label: string;
</script>

<label for={id}>{label}</label>
<input {id} type="range" max={ANALOG_MAX} />
