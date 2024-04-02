<script lang="ts">
	import DisconnectedDialog from "$lib/sws/components/DisconnectedDialog.svelte";
</script>

<div>
	<DisconnectedDialog></DisconnectedDialog>
	<header>Header</header>
	<main>Main</main>
	<footer>Footer</footer>
</div>

<style>
	div {
		width: 100%;
		height: 100%;

		flex-direction: column;
		display: flex;
		justify-content: space-between;
		align-items: center;

		background-color: #ddd;
		color: #000;
	}
</style>
