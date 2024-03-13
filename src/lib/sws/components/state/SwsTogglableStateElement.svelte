<script lang="ts">
    /**
     * @deprecated
     */

	import { booleans } from "$lib/sws/store";

	export let id: string;

	let state = booleans.get(id);
</script>

{#if $state}
	<slot name="true"></slot>
{:else}
	<slot name="false"></slot>
{/if}
