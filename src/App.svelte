<script lang="ts">
	import MyCheckbox from "./components/input/MyCheckboxInput.svelte";
	import MyNumber from "./components/span/MyNumberSpan.svelte";
	import MyPercent from "./components/span/MyPercentSpan.svelte";
	import MyRangePercent from "./components/input/MyRangePercentInput.svelte";
	import TestButton from "./components/button/TestButton.svelte";
    import MyButton from "./components/button/MyButton.svelte";
    import Hidable from "./components/Hidable.svelte";

    import { connected } from "$lib/websocket/wrapper";
</script>

<Hidable visible={!$connected}><span class="toast red"><strong>Lost Connection</strong></span></Hidable>
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
		<MyNumber id="ab" />
	</div>

	<div>
		<TestButton id="ab" />
		<MyButton id="holdable">Holdable button</MyButton>
	</div>

	<div>
		<label for="mics.mute">Mics Mute</label>
		<MyCheckbox id="mics.mute" />
	</div>

	<div>
		<label for="speaker.level.percent">Speaker Level</label>
		<MyRangePercent id="speaker.level.percent" />
		<MyPercent id="speaker.level.percent" />
	</div>
</main>
<footer>Footer</footer>

<style>
	.toast {
		position: fixed;
		top: 0;
		right: 0;
	}
	.red {
		color: #F00;
	}
</style>
