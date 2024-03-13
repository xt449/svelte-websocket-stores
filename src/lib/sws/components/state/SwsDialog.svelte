<script lang="ts">
    export let visible: boolean;

    let dialog: HTMLDialogElement;

    $: {
        if(visible) {
            dialog?.show();
        } else {
            dialog?.close();
        }
    }
</script>

<dialog bind:this={dialog}>
    <slot></slot>
</dialog>
