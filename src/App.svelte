<script lang="ts">
    import { ANALOG_MAX, ANALOG_MIN } from "$lib/crestron";
	import { connected } from "$lib/sws/wrapper";
	import { numbers } from "$lib/sws/store";

	import MyCheckbox from "$lib/sws/components/input/MyCheckboxInput.svelte";
	import TestButton from "$lib/sws/components/button/TestButton.svelte";
	import MyNumber from "$lib/sws/components/span/MyNumberSpan.svelte";
	import MyPercent from "$lib/sws/components/span/MyPercentSpan.svelte";
	import MyRangePercent from "$lib/sws/components/input/MyRangePercentInput.svelte";
	import MyHoldableButton from "$lib/sws/components/button/MyHoldableButton.svelte";
    import MyToggleButton from "$lib/sws/components/button/MyToggleButton.svelte";

	let disconnectedDialog: HTMLDialogElement;

	let speakerVolume = numbers.get("speaker.level.percent.value");

    $: {
        if($connected) {
            disconnectedDialog?.close();
        } else {
            disconnectedDialog?.showModal();
        }
    }
</script>

<dialog bind:this={disconnectedDialog} class="red" style="z-index:999;"><h1>Connecting to processor...</h1></dialog>
<header>Header</header>
<main>
	<h1>Crestron-Svelte Demo</h1>

	<div>Viewport Width: {window.visualViewport?.width}</div>
	<div>Inner Width: {window.innerWidth}</div>
	<div>Outer Width: {window.outerWidth}</div>

	<div>Viewport Height: {window.visualViewport?.height}</div>
	<div>Inner Height: {window.innerHeight}</div>
	<div>Outer Height: {window.outerHeight}</div>

	<div>
		<TestButton id="random" />
		<MyNumber id="random" />
	</div>

	<div>
		<label for="mics.mute.value">Mics Mute</label>
		<MyCheckbox id="mics.mute.value" />
	</div>
	
	<div>
		{#if $speakerVolume < ANALOG_MIN + 4096}
			<span>quiet</span>
		{:else if $speakerVolume > ANALOG_MAX - 4096}
			<span>LOUD</span>
		{:else}
			<span>Normal</span>
		{/if}
	</div>

	<div>
		<MyHoldableButton id="test.state">Holdable button</MyHoldableButton>
		<MyToggleButton id="test.state">Toggle button</MyToggleButton>
	</div>

	<div>
		<label for="speaker.level.percent">Speaker Level</label>
		<MyRangePercent id="speaker.level.percent.value" />
		<MyPercent id="speaker.level.percent.value" />
	</div>
</main>
<footer>Footer</footer>

<style>
	.red {
		color: #F00;
	}
</style>
