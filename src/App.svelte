<script lang="ts">
	// Import to start WebSocket ASAP
	import './lib/websocket/wrapper';

	import MySpan from './components/MySpan.svelte';
	import MyButton from './components/MyButton.svelte';
    import MyToggle from './components/MyToggle.svelte';
    import MyRange from './components/MyRange.svelte';
</script>

<main>
	<h1>Svelte Demo</h1>

	<div>
		<MySpan id="ab" />
	</div>

	<div>
		<MyButton id="ab" />
	</div>

	<div>
		<MyToggle id="mics.mute" label="Mics Mute" />
	</div>

	<div>
		<MyRange id="speaker.level.percent" label="Speaker Level" />
	</div>
</main>

<style>
</style>
