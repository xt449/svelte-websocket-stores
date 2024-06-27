# svelte-websocket-stores

Synchronize primitive-typed Svelte stores across a simple WebSocket connection.

[![npm version](https://img.shields.io/npm/v/svelte-websocket-stores.svg)](https://www.npmjs.com/package/svelte-websocket-stores) [![license](https://img.shields.io/npm/l/svelte-websocket-stores.svg)](LICENSE.md)

### Purpose

This was originally designed to allow touch panels to use [Svelte](https://www.npmjs.com/package/svelte) with any backend.

## Usage

```ts
import { initialize } from 'svelte-websocket-stores/websocket';

initialize({
	server_address: "172.16.0.2",
	local_id_prefix: "tp1."
});
```
