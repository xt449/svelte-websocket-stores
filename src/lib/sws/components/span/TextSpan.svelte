<script lang="ts">
	import { strings } from "$lib/sws/store";

	export let id: string;

	let value = strings.get(id);
</script>

<span>{$value}</span>
