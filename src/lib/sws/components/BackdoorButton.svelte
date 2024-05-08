<script lang="ts">
	export let backdoorTrigger: () => void;

	let timeout: NodeJS.Timeout | undefined;

	function press() {
		// Clear any previous press timers
		clearTimeout(timeout);

		timeout = setTimeout(() => {
			timeout = undefined;

			backdoorTrigger();
		}, 3_000);
	}

	function release() {
		clearTimeout(timeout);

		timeout = undefined;
	}

	document.addEventListener("pointerdown", (event) => {
		// Is over button
		if (document.elementsFromPoint(event.clientX, event.clientY).some((other) => other.matches(".backdoor-button"))) {
			press();
		}
	});

	document.addEventListener("pointerup", (event) => {
		// Is over button
		if (document.elementsFromPoint(event.clientX, event.clientY).some((other) => other.matches(".backdoor-button"))) {
			release();
		}
	});

	document.addEventListener("pointermove", (event) => {
		// Is NOT over button
		if (!document.elementsFromPoint(event.clientX, event.clientY).some((other) => other.matches(".backdoor-button"))) {
			release();
		}
	});
</script>

<div class="backdoor-button"></div>

<style>
	.backdoor-button {
		position: fixed;
		top: 0;
		left: 0;

		width: 128px;
		height: 128px;

		z-index: -128;
	}

	/* This is required to listen to mouse events after it has moved */
	:global(:root) {
		touch-action: none;
	}
</style>
