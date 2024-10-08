import { writable, type Readable, type Writable } from "svelte/store";
import { StoreDictionary } from "./store.js";

const GLOBAL_SCOPE = "global";

// Configuration
export interface Configuration {
	server_address: string,
	server_port: number,
	local_scope: string,
}

// Type aliases
type MessageType = "boolean" | "number" | "string" | "object";
type MessageValue = boolean | number | string | object;

// WebSocket message object structure
interface Message {
	scope: string;
	id: string;
	type: MessageType;
	value: MessageValue;
};

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
	private objects: StoreDictionary<object>;

	// Backing WebSocket connection
	private ws?: WebSocket;

	constructor(config: Configuration) {
		// Check for valid config
		if (config.local_scope === undefined || config.server_address === undefined || config.server_port === undefined) {
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
		this.booleans = new StoreDictionary<boolean>(false, this.sendBoolean);
		this.numbers = new StoreDictionary<number>(0, this.sendNumber);
		this.strings = new StoreDictionary<string>("", this.sendString);
		this.objects = new StoreDictionary<object>({}, this.sendObject);
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
			let message: Message = JSON.parse(event.data);

			// Abort if scope is not global or does not match local
			if (message.scope !== GLOBAL_SCOPE && message.scope !== this.config.local_scope) {
				return;
			}

			switch (message.type) {
				case "boolean": {
					console.debug(`[SWS] local<-'${message.scope}' boolean update ${message.id} = ${message.value}`);
					// Set locally
					this.booleans.get(message.id).setLocally(Boolean(message.value));
					break;
				}
				case "number": {
					console.debug(`[SWS] local<-'${message.scope}' number update ${message.id} = ${message.value}`);
					// Set locally
					this.numbers.get(message.id).setLocally(Number(message.value));
					break;
				}
				case "string": {
					console.debug(`[SWS] local<-'${message.scope}' string update ${message.id} = ${message.value}`);
					// Set locally
					this.strings.get(message.id).setLocally(String(message.value));
					break;
				}
				case "object": {
					console.debug(`[SWS] local<-'${message.scope}' object update ${message.id} = ${message.value}`);
					// Set locally
					this.objects.get(message.id).setLocally(Object(message.value));
					break;
				}
			}
		};
	}

	private sendBoolean(id: string, value: boolean) {
		// Abort if WebSocket undefined or not opened
		if (this.ws?.readyState !== WebSocket.OPEN) {
			return;
		}

		console.debug(`[SWS] '${this.config.local_scope}'->remote boolean update ${id} = ${value}`);

		// Send over WebSocket
		this.ws.send(`{"scope":"${this.config.local_scope}","id":"${id}","type":"boolean","value":${JSON.stringify(value)}}`);
	}

	private sendNumber(id: string, value: number) {
		// Abort if WebSocket undefined or not opened
		if (this.ws?.readyState !== WebSocket.OPEN) {
			return;
		}

		console.debug(`[SWS] '${this.config.local_scope}'->remote number update ${id} = ${value}`);

		// Send over WebSocket
		this.ws.send(`{"scope":"${this.config.local_scope}","id":"${id}","type":"number","value":${JSON.stringify(value)}}`);
	}

	private sendString(id: string, value: string) {
		// Abort if WebSocket undefined or not opened
		if (this.ws?.readyState !== WebSocket.OPEN) {
			return;
		}

		console.debug(`[SWS] '${this.config.local_scope}'->remote string update ${id} = ${value}`);

		// Send over WebSocket
		this.ws.send(`{"scope":"${this.config.local_scope}","id":"${id}","type":"string","value":"${JSON.stringify(value)}"}`);
	}

	private sendObject(id: string, value: object) {
		// Abort if WebSocket undefined or not opened
		if (this.ws?.readyState !== WebSocket.OPEN) {
			return;
		}

		console.debug(`[SWS] '${this.config.local_scope}'->remote object update ${id} = ${value}`);

		// Send over WebSocket
		this.ws.send(`{"scope":"${this.config.local_scope}","id":"${id}","type":"object","value":"${JSON.stringify(value)}"}`);
	}
}
