<script lang="ts">
	export let visible: boolean;
</script>

{#if visible}
	<slot />
{/if}
