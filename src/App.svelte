<script lang="ts">
	import './WebSocketWrapper'
	// import svelteLogo from './assets/svelte.svg'
	import Counter from './components/Counter.svelte'
    // import SvelteSpan from './components/SvelteSpan.svelte';
    // import SvelteButton from './components/SvelteButton.svelte';
	import MySpan from './components/MySpan.svelte';
	import MyButton from './components/MyButton.svelte';
    import MyToggle from './components/MyToggle.svelte';
    import MyRange from './components/MyRange.svelte';
</script>

<main>
	<h1>Svelte Demo</h1>

	<div>
		<Counter />
	</div>

	<div>
		<!-- <SvelteSpan id="abc" /> -->
	</div>

	<div>
		<!-- <SvelteButton id="abc" /> -->
	</div>

	<div>
		<MySpan id="" />
	</div>

	<div>
		<MyButton id="" />
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
