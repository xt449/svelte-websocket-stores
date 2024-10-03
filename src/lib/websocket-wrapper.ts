import { writable, type Readable, type Writable } from "svelte/store";
import { webSocketStore } from "./store.js";

type Message = {
	id: string;
	value: any;
};

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

		// Check for valid config
		if (config.server_address === undefined) {
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
			let payload: Message = JSON.parse(event.data);

			console.debug(`[SWS] local<-remote update ${payload.id} = ${payload.value}`);
			// Set locally
			webSocketStore(payload.id).setLocally(payload.value);
		};
	}

	sendStoreValueUpdate(id: string, value: string) {
		// Abort if WebSocket undefined or not opened
		if (this.ws?.readyState !== WebSocket.OPEN) {
			return;
		}

		console.debug(`[SWS] local->remote update ${id} = ${value}`);

		this.ws.send(`{"id":"${id}","type":"${typeof value}","value":${JSON.stringify(value)}`);
	}
}

const instance = new WebSocketWrapper();

export const connected = instance.connected;

// Singleton function export must be wrapped
export function initialize(config: Configuration) {
	instance.initialize(config);
}

// Singleton function export must be wrapped
export function sendStoreValueUpdate(id: string, value: any) {
	instance.sendStoreValueUpdate(id, value);
}

// Configuration

export type Configuration = {
	server_address: string,
}
