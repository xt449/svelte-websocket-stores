<script lang="ts">
    export let id: string;
    export let label: string;
</script>

<label for={id}>{label}</label>
<input {id} type="checkbox" />
