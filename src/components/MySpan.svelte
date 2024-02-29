<script lang="ts">
	import { integers } from '../stores.ts';
	
	export let id: string;

	$: value = $integers[id];
</script>

<span>{value}</span>
