import { readonly, writable, type Readable, type Writable } from "svelte/store";

const GLOBAL_SCOPE = "global";

/**
 * Json type
 */
export type Json = boolean | number | string | { [key: string]: Json } | Json[] | null;

/**
 * Svelte store that updates accross websocket interface with extra `setLocally` method for client-only reactivity when needed
 */
export interface WebSocketStore<T> extends Readable<T> {
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
};

/**
 * WebSocket wrapper class and entry point
 */
export class WebSocketWrapper {
	// Connection state store
	private readonly connectionStore: Writable<boolean>;
	readonly connectionState: Readable<boolean>;

	// The WebSocketStore dictionary for this instance
	private readonly storeDictionary: Record<string, WebSocketStore<Json>>;

	// Backing WebSocket connection
	private ws?: WebSocket;

	private hearbeatIntervalId: number;

	/**
	 * Whether to log messages to console
	 */
	messageLogging: boolean;

	constructor(readonly serverUrl: string, readonly localScope: string, readonly reconnectDelayMs: number = 10_000) {
		console.assert(this.serverUrl != null, "Unable to initialize WebSocketWrapper: 'serverUrl' must not be falsey!");
		console.assert(this.localScope != null, "Unable to initialize WebSocketWrapper: 'localScope' must not be falsey!");

		// Create connection state store
		this.connectionStore = writable(false);
		this.connectionState = readonly(this.connectionStore);

		this.storeDictionary = {};

		this.hearbeatIntervalId = 0;

		this.messageLogging = false;
	}

	/**
	 * Initialize connection to WebSocket server.
	 * On connection loss, a new connection will be started after {@link reconnectDelayMs}.
	 */
	start(): void {
		// Abort if WebSocket already opened
		if (this.ws?.readyState === WebSocket.OPEN) {
			console.info("[SWS] WebSocket already open");
			return;
		}

		// Abort if WebSocket already connecting
		if (this.ws?.readyState === WebSocket.CONNECTING) {
			console.info("[SWS] WebSocket already connecting");
			return;
		}

		// Start websocket
		console.info(`[SWS] WebSocket starting... Connecting to ${this.serverUrl}`);
		this.ws = new WebSocket(this.serverUrl);

		// Initialize event listenters
		this.ws.onopen = event => {
			console.info("[SWS] WebSocket opened");

			// Start manual heartbeat
			setInterval(this.sendHearbeat, 10_000);

			// Set connection state to true
			this.connectionStore.set(true);
		}
		this.ws.onerror = event => {
			console.warn("[SWS] WebSocket errored:", event);
		};
		this.ws.onclose = event => {
			console.info(`[SWS] WebSocket closed: Reconnecting in ${this.reconnectDelayMs / 1000} seconds...`);

			// Stop manual heartbeat
			clearInterval(this.hearbeatIntervalId);

			// Set connection state to false
			this.connectionStore.set(false);

			// Execute after delay
			setTimeout(() => this.start(), this.reconnectDelayMs);
		};
		this.ws.onmessage = event => {
			let message: Message = JSON.parse(event.data);

			// Abort if scope is not global or does not match local
			if (message.scope !== GLOBAL_SCOPE && message.scope !== this.localScope) {
				return;
			}

			// Log message if enabled
			if (this.messageLogging) {
				console.debug(`[SWS] local<-'${message.scope}' update '${message.id}' = ${message.value}`);
			}

			// Set locally
			this.webSocketStore(message.id, message.value).setLocally(message.value);
		};
	}

	/**
	 * Pseudo-constructor for {@link WebSocketStore}
	 * @param id Store identifier
	 * @param defaultValue Initial value of store; ignored if store already exists with given id
	 * @returns New store or existing store if one already exists with given id;
	 */
	webSocketStore<T extends Json = Json>(id: string, defaultValue: T): WebSocketStore<T> {
		// Check if store already exists with given id
		let webSocketStore = this.storeDictionary[id];
		if (webSocketStore !== undefined) {
			// Return existing store
			return webSocketStore as WebSocketStore<T>;
		}

		// Else, create new store

		// Do not allow undefined values
		if (defaultValue === undefined) {
			console.trace(`[SWS] Tried to initialize '${id}' to undefined. Use null instead.`);
			throw new Error(`Tried to initialize '${id}' to undefined.`);
		}

		// Backing store
		const store = writable(defaultValue);

		// WebSocketStore implementation of set function
		const set = (value: T): void => {
			// Do not allow undefined values
			if (value === undefined) {
				console.trace(`[SWS] Tried to set '${id}' to undefined. Use null instead.`);
				return;
			}

			// Set locally first for better reactivity
			store.set(value);

			// Send update to websocket
			this.sendMessage({
				id: id,
				scope: this.localScope,
				value: value,
			});
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

	private sendMessage(message: Message): void {
		// Abort if WebSocket undefined or not OPEN
		if (this.ws?.readyState !== WebSocket.OPEN) {
			return;
		}

		// Send over WebSocket
		this.ws.send(JSON.stringify(message));

		// Log message if enabled
		if (this.messageLogging) {
			console.debug(`[SWS] local->'${message.scope}' update '${message.id}' = ${message.value}`);
		}
	}

	private sendHearbeat(): void {
		// Abort if WebSocket undefined or not OPEN
		if (this.ws?.readyState !== WebSocket.OPEN) {
			// Clear interval
			clearInterval(this.hearbeatIntervalId);

			return;
		}

		// Send empty object
		this.ws?.send("{}");
	}
};
