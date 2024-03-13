<script lang="ts">
    /**
     * @deprecated
     */

	export let visible: boolean;
</script>

{#if visible}
	<slot></slot>
{/if}
