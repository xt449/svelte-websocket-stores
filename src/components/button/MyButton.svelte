<script lang="ts">
    import { booleans } from "$lib/websocket/store";

    export let id: string;

    let press = booleans.get(`${id}.press`);

    function release() {
        if($press) {
            $press = false;
        }
    }
</script>

<button on:pointerdown={() => $press = true} on:pointerup={release} on:pointerout={release}>
    <slot />
</button>
