import { writable, type Readable, type Writable } from "svelte/store";
import { booleans, numbers, strings } from "./store.js";

const GLOBAL_SCOPE = "global";

class WebSocketWrapper {
	private config?: Configuration;
	private ws?: WebSocket;
	private connectionState: Writable<boolean>;
	connected: Readable<boolean>;

	constructor() {
		this.connectionState = writable(false);
		// Create our own Readable store
		this.connected = { subscribe: this.connectionState.subscribe };
	}

	initialize(config: Configuration) {
		// Only run once
		if (this.config) {
			return;
		}

		// Check for valid con
		if (config.local_scope === undefined || config.server_address === undefined) {
			console.error("[SWS] Unable to initialize WebSocketWrapper: Invalid configuration!");
			return;
		}

		this.config = config;

		this.start();
	}

	private start() {
		if (this.ws?.readyState === WebSocket.OPEN) {
			return;
		}

		console.info("[SWS] WebSocket starting...");

		// Start networking
		this.ws = new WebSocket(`ws://${this.config!.server_address}:50080`);

		// Init listenters
		this.ws.onopen = event => {
			console.info("[SWS] WebSocket opened");
			this.connectionState.set(true);
		}
		this.ws.onerror = event => {
			console.warn("[SWS] WebSocket errored:", event);
		};
		this.ws.onclose = event => {
			console.info("[SWS] WebSocket closed: Reconnecting in 10 seconds...")
			this.connectionState.set(false);

			setTimeout(() => this.start(), 10_000);
		};
		this.ws.onmessage = event => {
			let payload = JSON.parse(event.data);

			// Abort if scope is not global or does not match local
			if (payload.scope !== GLOBAL_SCOPE && payload.scope !== this.config!.local_scope) {
				return;
			}

			switch (payload.type) {
				case "boolean": {
					console.debug(`[SWS] local<-'${payload.scope}' boolean update ${payload.id} = ${payload.value}`);
					// Set locally
					booleans.get(payload.id).setLocally(Boolean(payload.value));
					break;
				}
				case "number": {
					console.debug(`[SWS] local<-'${payload.scope}' number update ${payload.id} = ${payload.value}`);
					// Set locally
					numbers.get(payload.id).setLocally(Number(payload.value));
					break;
				}
				case "string": {
					console.debug(`[SWS] local<-'${payload.scope}' string update ${payload.id} = ${payload.value}`);
					// Set locally
					strings.get(payload.id).setLocally(String(payload.value));
					break;
				}
			}
		};

		// Keep (Not?) Alive
		setInterval(() => {
			if (this.ws?.readyState === WebSocket.OPEN) {
				this.ws?.send("{}");
			}
		}, 30_000);
	}

	sendBooleanValue(id: string, value: boolean) {
		// Abort if WebSocket undefined or not opened
		if (this.ws?.readyState !== WebSocket.OPEN) {
			return;
		}

		console.debug(`[SWS] '${this.config!.local_scope}'->remote boolean update ${id} = ${value}`);

		// Send over WebSocket
		this.ws.send(`{"scope":"${this.config!.local_scope}","id":"${id}","type":"boolean","value":${Boolean(value)}}`);
	}

	sendNumberValue(id: string, value: number) {
		// Abort if WebSocket undefined or not opened
		if (this.ws?.readyState !== WebSocket.OPEN) {
			return;
		}

		console.debug(`[SWS] '${this.config!.local_scope}'->remote number update ${id} = ${value}`);

		// Send over WebSocket
		this.ws.send(`{"scope":"${this.config!.local_scope}","id":"${id}","type":"number","value":${Number(value)}}`);
	}

	sendStringValue(id: string, value: string) {
		// Abort if WebSocket undefined or not opened
		if (this.ws?.readyState !== WebSocket.OPEN) {
			return;
		}

		console.debug(`[SWS] '${this.config!.local_scope}'->remote string update ${id} = ${value}`);

		// Send over WebSocket
		this.ws.send(`{"scope":"${this.config!.local_scope}","id":"${id}","type":"string","value":"${String(value)}"}`);
	}
}

const instance = new WebSocketWrapper();

export const connected = instance.connected;

// Singleton function export must be wrapped
export function initialize(config: Configuration) {
	instance.initialize(config);
}

// Singleton function export must be wrapped
export function sendBooleanValue(id: string, value: boolean) {
	instance.sendBooleanValue(id, value);
}

// Singleton function export must be wrapped
export function sendNumberValue(id: string, value: number) {
	instance.sendNumberValue(id, value);
}

// Singleton function export must be wrapped
export function sendStringValue(id: string, value: string) {
	instance.sendStringValue(id, value);
}

// Configuration

export type Configuration = {
	server_address: string,
	local_scope: string,
}
