<script lang="ts">
	import { webSocketWrapper } from '../WebSocketWrapper.ts';

	export let id: string;

    function randomize() {
        webSocketWrapper.setInteger(id, Math.floor(Math.random() * 999));
    }
</script>

<button on:click={randomize}>Random</button>
