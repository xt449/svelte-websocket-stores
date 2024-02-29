<script lang="ts">
	import './WebSocketWrapper.ts'
	// import svelteLogo from './assets/svelte.svg'
	import Counter from './components/Counter.svelte'
    // import SvelteSpan from './components/SvelteSpan.svelte';
    // import SvelteButton from './components/SvelteButton.svelte';
	import MySpan from './components/MySpan.svelte';
	import MyButton from './components/MyButton.svelte';
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
		<MySpan id="mic1.level" />
	</div>

	<div>
		<MyButton id="mic1.level" />
	</div>
</main>

<style>
</style>
