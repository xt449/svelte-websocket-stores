# svelte-websocket-stores

Synchronize primitive-typed Svelte stores across a simple WebSocket connection.

[![npm version](https://img.shields.io/npm/v/svelte-websocket-stores.svg)](https://www.npmjs.com/package/svelte-websocket-stores) [![license](https://img.shields.io/npm/l/svelte-websocket-stores.svg)](LICENSE)

### Purpose

This was originally designed to allow touch panels to use [Svelte](https://www.npmjs.com/package/svelte) with any backend.

## Usage

Initialization
```ts
import { WebSocketWrapper } from "svelte-websocket-stores/websocket"

export const sws: WebSocketWrapper = new WebSocketWrapper({
	server_address: "192.168.0.64",
	server_port: 80,
	local_scope: "tp1"
});
sws.start();
```

Write-only example
```svelte
<script>
	import { sws } from "main.ts";

	let pressStore = sws.booleans.get("myCoolButton.press");

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

Read-only exmaple
```svelte
<script>
	import { sws } from "main.ts";

	let sizeStore = sws.numbers.get("myList.size");
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
type Message = {
	scope: string,
	id: string,
	type: "boolean" | "number" | "string" | "object",
	value: boolean | number | string | object,
}
```
The field `scope` identifies the scope of the client it comes from and limits which clients receive it when coming from the server.
The field `type` determines how the `value` field is interpreted as well as which of the tables (booleans, numbers, strings, or objects) the `id` field will be indexing into.

### Client

#### Message Received
1. The incoming text data is parsed as JSON.
2. The object's `scope` field is checked if it is global ("global") or matches the client's local scope (for example "tp1"). If it does not match, the message is discarded.
3. The object's `type` field is switched on with the cases `"boolean"`, `"number"`, `"string"`, and `"object"`. If there is no match, the message is discarded.
4. The local Svelte store is indexed by the object's `id` field from the dictionary holding the respectively typed stores.
5. The store's value is assigned to the object's `value` field, cast to its respective type.

### Server [^1]

#### Client Connected
1. Send the client messages for all the variables currently stored values

#### Message Received
1. The incoming text data is parsed as JSON.
2. The object's `type` field is switched on with the cases `"boolean"`, `"number"`, `"string"`, and `"object"`. If there is no match, the message is discarded.
3. The variable is indexed by the object's `scope` and `id` fields from the dictionary holding the respectively typed variables.
4. The variable's value is assigned to the object's `value` field, cast to its respective type.
5. Send all clients a message for the new value.
6. Handle any events.

[^1]: This is the behavior expected by this WebSocket client
