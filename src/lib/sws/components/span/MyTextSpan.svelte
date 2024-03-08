<script lang="ts">
	import { strings } from "$lib/sws/store";

	export let id: string;

	let value = strings.get(`${id}.value`);
</script>

<span>{$value}</span>
