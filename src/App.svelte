<script lang="ts">
	import MyCheckbox from "./components/input/MyCheckboxInput.svelte";
	import MyNumber from "./components/span/MyNumberSpan.svelte";
	import MyPercent from "./components/span/MyPercentSpan.svelte";
	import MyRange from "./components/input/MyRangeInput.svelte";
	import TestButton from "./components/button/TestButton.svelte";
</script>

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
	</div>

	<div>
		<label for="mics.mute">Mics Mute</label>
		<MyCheckbox id="mics.mute" />
	</div>

	<div>
		<label for="speaker.level.percent">Speaker Level</label>
		<MyRange id="speaker.level.percent" />
		<MyPercent id="speaker.level.percent" />
	</div>
</main>
<footer>Footer</footer>

<style>
</style>
