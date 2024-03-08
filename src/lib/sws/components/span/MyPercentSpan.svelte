<script lang="ts">
    import { ANALOG_MAX } from "$lib/crestron";
    import { numbers } from "$lib/sws/store";

    export let id: string;

    let value = numbers.get(id);
</script>

<span>{Math.round(($value * 100) / ANALOG_MAX)}%</span>