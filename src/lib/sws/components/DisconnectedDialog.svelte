<script lang="ts">
	import { connected } from "$lib/sws/wrapper";

	let disconnectedDialog: HTMLDialogElement;

	$: {
		if ($connected) {
			disconnectedDialog?.close();
		} else {
			disconnectedDialog?.showModal();
		}
	}
</script>

<dialog bind:this={disconnectedDialog}>
	<h1>Connecting to processor...</h1>
</dialog>

<style>
	dialog {
		border: 3px solid #fff;
		border-radius: 16px;
		background-color: #000;
		font-size: 2rem;
		color: #f40;
		animation: fade 2s infinite;
	}

	@keyframes fade {
		50% {
			color: #620;
		}
	}
</style>
