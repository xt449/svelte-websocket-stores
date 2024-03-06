<script lang="ts">
	import { numbers } from '../lib/websocket/store';
	
	export let id: string;

	let value = numbers.get(`${id}.value`);
</script>

<span>{$value}</span>
