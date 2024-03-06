<script lang="ts">
	// Import to start WebSocket ASAP
	import './lib/websocket/wrapper';

    import MyCheckbox from './components/MyCheckboxInput.svelte';
    import MyNumber from './components/MyNumberSpan.svelte';
    import MyPercent from './components/MyPercentSpan.svelte';
    import MyRange from './components/MyRangeInput.svelte';
	import TestButton from './components/TestButton.svelte';
</script>

<main>
	<h1>Crestron-Svelte Demo</h1>

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

<style>
</style>
