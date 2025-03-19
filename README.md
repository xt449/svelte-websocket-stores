# svelte-websocket-stores

Synchronize primitive-typed Svelte stores across a simple WebSocket connection.

[![npm version](https://img.shields.io/npm/v/svelte-websocket-stores.svg)](https://www.npmjs.com/package/svelte-websocket-stores) [![license](https://img.shields.io/npm/l/svelte-websocket-stores.svg)](LICENSE)

### Purpose

This was originally designed to allow touch panels to use [Svelte](https://www.npmjs.com/package/svelte) with any backend.

## Usage

Initialization
`main.ts`
```ts
import { WebSocketWrapper } from "svelte-websocket-stores"

export const sws: WebSocketWrapper = new WebSocketWrapper("ws://192.168.0.64:80", "tp1");
sws.start();
```

Write-only example
`component.svelte`
```svelte
<script>
	import { sws } from "main.ts";

	let pressStore = sws.webSocketStore<boolean>("myCoolButton.press");

	function press() {
		$pressStore = true;
	}

	function release() {
		$pressStore = false;
	}
</script>

<button
	on:pointerdown={press}
	on:pointerup={release}
	on:pointerout={release}>
	<slot />
</button>
```

Read-only example
`component.svelte`
```svelte
<script>
	import { sws } from "main.ts";

	let sizeStore = sws.webSocketStore<number>("myList.size");
</script>

<div>
	{#each { length: $sizeStore } as _, index}
		<slot />
	{/each}
</div>
```

## WebSocket Message Format

All communication between a server and this library is over WebSocket.

All WebSocket messages are interpreted as JSON objects.

The message object is defined as:
```ts
type Json = boolean | number | string | { [key: string]: Json } | Json[] | null;
type Message = {
	scope: string;
	id: string;
	value: Json;
}
```
The field `scope` identifies the scope of the client it comes from and limits which clients receive it when coming from the server.
The field `id` is the primary identifier and determines where the `value` field is stored.

### Client

#### Message Received
1. The incoming text data is parsed as JSON.
2. The object's `scope` field is checked if it is global ("global") or matches the client's local scope (for example "tp1"). If it does not match, the message is discarded.
3. The local Svelte store is indexed by the object's `id` field from the dictionary holding the respectively typed stores.
4. The store's value is assigned to the object's `value` field.

### Server [^1]

#### Client Connected
1. Send the client messages for all the variables currently stored values

#### Message Received
1. The incoming text data is parsed as JSON.
2. The variable is indexed by the object's `scope` and `id` fields from the dictionary holding the respectively typed variables.
3. The variable's value is assigned to the object's `value` field.
4. Send all clients a message for the new value.
5. Handle any events.

[^1]: This is the behavior expected by this WebSocket client
