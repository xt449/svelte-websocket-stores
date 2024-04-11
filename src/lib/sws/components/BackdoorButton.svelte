<script lang="ts">
	export let backdoorTrigger: () => void;

	let timeout: NodeJS.Timeout | undefined;

	function press() {
		timeout = setTimeout(() => {
			timeout = undefined;

			backdoorTrigger();
		}, 3_000);
	}

	function release() {
		clearTimeout(timeout);

		if (timeout) {
			timeout = undefined;
		}
	}

	document.addEventListener("pointerdown", (event) => {
		if (document.elementsFromPoint(event.clientX, event.clientY).some((other) => other.matches(".backdoor-region"))) {
			press();
		}
	});

	document.addEventListener("pointerup", (event) => {
		if (document.elementsFromPoint(event.clientX, event.clientY).some((other) => other.matches(".backdoor-region"))) {
			release();
		}
	});

	document.addEventListener("pointerleave", (event) => {
		if (document.elementsFromPoint(event.clientX, event.clientY).some((other) => other.matches(".backdoor-region"))) {
			release();
		}
	});
</script>

<div class="backdoor-region"></div>

<style>
	.backdoor-region {
		position: fixed;
		top: 0;
		left: 0;

		width: 128px;
		height: 128px;

		z-index: -128;
	}
</style>
