import { writable, type Readable, type Writable } from "svelte/store";
import { StoreDictionary } from "./store.js";

const GLOBAL_SCOPE = "global";

// Configuration

export interface Configuration {
	server_address: string,
	server_port: number,
	local_scope: string,
}

// Wrapper

export class WebSocketWrapper {
	private config: Configuration;

	// Connection state stores
	private connectionState: Writable<boolean>;
	connected: Readable<boolean>;

	// Store dictionaries
	private booleans: StoreDictionary<boolean>;
	private numbers: StoreDictionary<number>;
	private strings: StoreDictionary<string>;

	// Backing WebSocket connection
	private ws?: WebSocket;

	constructor(config: Configuration) {
		// Check for valid config
		if (config.local_scope === undefined || config.server_address === undefined || config.server_port === undefined ) {
			console.error("[SWS] Unable to initialize WebSocketWrapper: Invalid configuration!");
			throw new Error("[SWS] Unable to initialize WebSocketWrapper: Invalid configuration!");
		}

		// Set config value
		this.config = config;

		// Create connection state stores
		this.connectionState = writable(false);
		// Create our own Readable store
		this.connected = { subscribe: this.connectionState.subscribe };

		// Store dictionaries
		this.booleans = new StoreDictionary<boolean>(false, this.sendBooleanValue);
		this.numbers = new StoreDictionary<number>(0, this.sendNumberValue);
		this.strings = new StoreDictionary<string>("", this.sendStringValue);
	}

	start() {
		// Abort if WebSocket already opened
		if (this.ws?.readyState === WebSocket.OPEN) {
			return;
		}

		// Start websocket
		console.info("[SWS] WebSocket starting...");
		this.ws = new WebSocket(`ws://${this.config.server_address}:${this.config.server_port}`);

		// Initialize event listenters
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

			// Execute after 10 seconds
			setTimeout(() => this.start(), 10_000);
		};
		this.ws.onmessage = event => {
			let payload = JSON.parse(event.data);

			// Abort if scope is not global or does not match local
			if (payload.scope !== GLOBAL_SCOPE && payload.scope !== this.config.local_scope) {
				return;
			}

			switch (payload.type) {
				case "boolean": {
					console.debug(`[SWS] local<-'${payload.scope}' boolean update ${payload.id} = ${payload.value}`);
					// Set locally
					this.booleans.get(payload.id).setLocally(Boolean(payload.value));
					break;
				}
				case "number": {
					console.debug(`[SWS] local<-'${payload.scope}' number update ${payload.id} = ${payload.value}`);
					// Set locally
					this.numbers.get(payload.id).setLocally(Number(payload.value));
					break;
				}
				case "string": {
					console.debug(`[SWS] local<-'${payload.scope}' string update ${payload.id} = ${payload.value}`);
					// Set locally
					this.strings.get(payload.id).setLocally(String(payload.value));
					break;
				}
			}
		};
	}

	private sendBooleanValue(id: string, value: boolean) {
		// Abort if WebSocket undefined or not opened
		if (this.ws?.readyState !== WebSocket.OPEN) {
			return;
		}

		console.debug(`[SWS] '${this.config.local_scope}'->remote boolean update ${id} = ${value}`);

		// Send over WebSocket
		this.ws.send(`{"scope":"${this.config.local_scope}","id":"${id}","type":"boolean","value":${Boolean(value)}}`);
	}

	private sendNumberValue(id: string, value: number) {
		// Abort if WebSocket undefined or not opened
		if (this.ws?.readyState !== WebSocket.OPEN) {
			return;
		}

		console.debug(`[SWS] '${this.config.local_scope}'->remote number update ${id} = ${value}`);

		// Send over WebSocket
		this.ws.send(`{"scope":"${this.config.local_scope}","id":"${id}","type":"number","value":${Number(value)}}`);
	}

	private sendStringValue(id: string, value: string) {
		// Abort if WebSocket undefined or not opened
		if (this.ws?.readyState !== WebSocket.OPEN) {
			return;
		}

		console.debug(`[SWS] '${this.config.local_scope}'->remote string update ${id} = ${value}`);

		// Send over WebSocket
		this.ws.send(`{"scope":"${this.config.local_scope}","id":"${id}","type":"string","value":"${String(value)}"}`);
	}
}
