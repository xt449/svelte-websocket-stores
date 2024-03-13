<script lang="ts">
    import { booleans } from "$lib/sws/store";

    let clazz: string = "";
    export { clazz as class }
    export let id: string;

    let press = booleans.get(id);

    function release() {
        if($press) {
            $press = false;
        }
    }
</script>

<button class={clazz} class:active={$press} on:pointerdown={() => $press = true} on:pointerup={release} on:pointerout={release}>
    <slot></slot>
</button>
