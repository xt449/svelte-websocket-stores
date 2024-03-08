<script lang="ts">
    import { numbers } from "$lib/sws/store";

    export let id: string;

    let value = numbers.get(id);

    function randomize() {
        $value = Math.floor(Math.random() * 999);
    }
</script>

<button on:click={randomize}>Random</button>
