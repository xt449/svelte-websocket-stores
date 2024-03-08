// Import to start WebSocket ASAP
import '$lib/sws/wrapper';

import './global.css';
import App from './App.svelte';

const app = new App({
	target: document.getElementById('app')!,
});

export default app;
