import { readonly, writable, type Readable, type Writable } from "svelte/store";

const GLOBAL_SCOPE = "global";

/**
 * Json type
 */
export type Json = boolean | number | string | { [key: string]: Json } | Json[] | null;

/**
 * Svelte store that updates accross websocket interface with extra `setLocally` method for client-only reactivity when needed
 */
export interface WebSocketStore<T> extends Readable<T | undefined> {
	/**
	 * Set value, inform subscribers, and send update over WebSocket.
	 */
	set(this: void, value: T): void;
	/**
	 * Set value and inform subscribers.
	 */
	setLocally(this: void, value: T): void;
};

/**
 * WebSocket payload Message type
 */
export type Message = {
	scope: string;
	id: string;
	value: Json;
	type?: string;
};

/**
 * WebSocket wrapper class and entry point
 */
export class WebSocketWrapper {
	// Connection state store
	private readonly connectionState: Writable<boolean>;
	readonly readonlyConnectionState: Readable<boolean>;

	// The WebSocketStore dictionary for this instance
	private readonly storeDictionary: Record<string, WebSocketStore<Json>>;

	// Backing WebSocket connection
	private ws?: WebSocket;

	constructor(readonly serverHost: string, readonly serverPort: number, readonly localScope: string, readonly reconnectDelayMs: number = 10_000) {
		console.assert(this.serverHost != null, "Unable to initialize WebSocketWrapper: 'serverHost' must not be falsey!");
		console.assert(this.serverPort != null, "Unable to initialize WebSocketWrapper: 'serverPort' must not be falsey!");
		console.assert(this.localScope != null, "Unable to initialize WebSocketWrapper: 'localScope' must not be falsey!");

		// Create connection state store
		this.connectionState = writable(false);
		this.readonlyConnectionState = readonly(this.connectionState);

		this.storeDictionary = {};
	}

	start() {
		// Abort if WebSocket already opened
		if (this.ws?.readyState === WebSocket.OPEN) {
			console.info("[SWS] WebSocket already open");
			return;
		}

		// Start websocket
		console.info("[SWS] WebSocket starting...");
		this.ws = new WebSocket(`ws://${this.serverHost}:${this.serverPort}`);

		// Initialize event listenters
		this.ws.onopen = event => {
			console.info("[SWS] WebSocket opened");

			// Set connection state to true
			this.connectionState.set(true);
		}
		this.ws.onerror = event => {
			console.warn("[SWS] WebSocket errored:", event);
		};
		this.ws.onclose = event => {
			console.info(`[SWS] WebSocket closed: Reconnecting in ${this.reconnectDelayMs / 1000} seconds...`);

			// Set connection state to false
			this.connectionState.set(false);

			// Execute after delay
			setTimeout(() => this.start(), this.reconnectDelayMs);
		};
		this.ws.onmessage = event => {
			let message: Message = JSON.parse(event.data);

			// Abort if scope is not global or does not match local
			if (message.scope !== GLOBAL_SCOPE && message.scope !== this.localScope) {
				return;
			}

			console.debug(`[SWS] local<-'${message.scope}' update ${message.id} = ${message.value}`);

			// Set locally
			this.webSocketStore(message.id).setLocally(message.value);
		};
	}

	/**
	 * Pseudo-constructor for {@link WebSocketStore}
	 * @param id Store identifier
	 * @param defaultValue Initial value of store; ignored if store already exists with given id
	 * @returns New store or existing store if one already exists with given id;
	 */
	webSocketStore<T extends Json = Json>(id: string, defaultValue?: T): WebSocketStore<T> {
		// Check if store already exists with given id
		let webSocketStore = this.storeDictionary[id];
		if (webSocketStore !== undefined) {
			// Return existing store
			return webSocketStore as WebSocketStore<T>;
		}

		// Else, create new store

		// Backing store
		const store = writable(defaultValue);

		// WebSocketStore implementation of set function
		const set = (value: T): void => {
			// Set locally first for better reactivity
			store.set(value);

			// Send update to websocket
			this.sendStoreValueUpdate(id, value);
		};

		return this.storeDictionary[id] = {
			// Default subscribe function
			subscribe: store.subscribe,
			// WebSocketStore implementation of set function
			set,
			// Default set function
			setLocally: store.set,
		};
	}

	private sendMessage(message: Message) {
		// Abort if WebSocket undefined or not OPEN
		if (this.ws?.readyState !== WebSocket.OPEN) {
			return;
		}

		// Send over WebSocket
		this.ws.send(JSON.stringify(message));
	}

	private sendStoreValueUpdate(id: string, value: Json) {
		this.sendMessage({
			id: id,
			scope: this.localScope,
			value: value,
			type: typeof value,
		});
	}
};
