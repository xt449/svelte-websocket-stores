<script lang="ts">
	import { strings } from "$lib/sws/store";
	import PressButton from "./button/PressButton.svelte";

	let passwordPopupValue = strings.get("password.popup.value");

	let timeout: NodeJS.Timeout | undefined;
	let passwordPopupOpen = false;

	function press() {
		// Clear any previous press timers
		clearTimeout(timeout);

		timeout = setTimeout(() => {
			timeout = undefined;

			$passwordPopupValue = "";
			passwordPopupOpen = true;
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

{#if passwordPopupOpen}
	<div class="backdrop">
		<div class="popup">
			<h3>Enter password to continue</h3>
			<input type="password" bind:value={$passwordPopupValue} />
			<div class="buttons">
				<button on:pointerdown={() => (passwordPopupOpen = false)}>Cancel</button>
				<PressButton id="password.popup.confirm" class="primary">Confirm</PressButton>
			</div>
		</div>
	</div>
{/if}

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

	.backdrop {
		position: absolute;

		width: 100%;
		height: 100%;

		background-color: rgba(0, 0, 0, 0.25);
		color: #fff;

		display: flex;
		align-items: center;
		justify-content: center;

		z-index: 100;
	}

	.popup {
		padding: 1rem 1.5rem;

		display: flex;
		flex-direction: column;
		/* justify-content: space-between; */
		row-gap: 1.5rem;

		background-color: #444;
		border-radius: 0.5rem;

		box-shadow: 0 0 0.5rem 0 #000;
	}

	h3 {
		margin: 0;
	}

	input {
		height: 1.5rem;

		border: 0;
		border-radius: 0.25rem;

		font-size: 1rem;
		text-align: center;
	}

	.buttons {
		width: 100%;

		display: flex;
		column-gap: 1px;
	}

	.buttons :global(*) {
		height: 3rem;
		width: 100%;

		padding: 0.5rem 1.5rem;

		border: 0;

		background-color: #555;
		color: #fff;
		font-size: 1.25rem;
	}

	.buttons :global(:first-child) {
		border-radius: 0.25rem 0 0 0.25rem;
	}

	.buttons :global(:last-child) {
		border-radius: 0 0.25rem 0.25rem 0;
	}

	.buttons :global(.primary) {
		background-color: #557;
	}
</style>
