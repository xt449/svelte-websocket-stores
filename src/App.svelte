<script lang="ts">
    import { ANALOG_MAX, ANALOG_MIN } from "$lib/crestron";
	import { connected } from "$lib/sws/wrapper";
	import { numbers } from "$lib/sws/store";

	import NumberSpan from "$lib/sws/components/span/NumberSpan.svelte";
	import PercentSpan from "$lib/sws/components/span/PercentSpan.svelte";
	import RangePercentInput from "$lib/sws/components/input/RangePercentInput.svelte";
	import HoldableButton from "$lib/sws/components/button/HoldableButton.svelte";
    import TogglableButton from "$lib/sws/components/button/TogglableButton.svelte";
    import TogglableStateButton from "$lib/sws/components/button/TogglableStateButton.svelte";

	let disconnectedDialog: HTMLDialogElement;

	let speakerVolume = numbers.get("speaker.level.percent.value");

    $: {
		if(!window.location.href.includes("dist")) {
        if($connected) {
            disconnectedDialog?.close();
        } else {
            disconnectedDialog?.showModal();
			}
        }
    }
</script>

<dialog bind:this={disconnectedDialog} style="background-color:#000;color:#F00;font-size:2rem;z-index:999;"><h1>Connecting to processor...</h1></dialog>
<header>Header</header>
<main>
	<h1>Crestron-Svelte Demo</h1>

	<div>Viewport: {window.visualViewport?.width} x {window.visualViewport?.height}</div>
	<div>Window Inner: {window.innerWidth} x {window.innerHeight}</div>

	<br>

	<div>
		<NumberSpan id="random" />
	</div>

	<div>
		<HoldableButton id="test.state">Holdable button</HoldableButton>
		<TogglableButton id="test.state">Toggle button</TogglableButton>
	</div>

	<br>

	<div>
		<label for="speaker.level.percent.value">Speaker Level:</label>
		{#if $speakerVolume < ANALOG_MIN + 4096}
			<span>quiet</span>
		{:else if $speakerVolume > ANALOG_MAX - 4096}
			<span>LOUD</span>
		{:else}
			<span>Normal</span>
		{/if}
		<div style="display:flex;flex-direction:row;align-items:center;justify-content:center;">
			<!-- <MyCheckbox id="speaker.mute.value" /> -->
			<TogglableStateButton id="speaker.mute.value">
				<img slot="false" src="./assets/dazzle-line/volume-min-svgrepo-com.svg" class="svg-white" width="50" />
				<img slot="true" src="./assets/dazzle-line/volume-xmark-svgrepo-com.svg" class="svg-white" width="50" />
			</TogglableStateButton>
			<div style="width:50vw;"><RangePercentInput id="speaker.level.percent.value" /></div>
			<span style="width:3vw;"><PercentSpan id="speaker.level.percent.value" /></span>
		</div>
	</div>
</main>
<footer>Footer</footer>

<style>
</style>
