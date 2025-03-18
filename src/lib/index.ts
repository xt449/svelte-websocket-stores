import { readonly, writable, type Readable, type Writable } from "svelte/store";
import { derivedFromPath, setAtPath, type Json, type Path } from "./objectPath.js";

/**
 * Svelte store that updates accross websocket interface with extra `setLocally` method for client-only reactivity when needed
 */
export interface WebSocketStore<T> extends Readable<T> {
	/**
	 * Set value, inform subscribers, and send update over WebSocket.
	 */
	set(this: void, value: T): void;
};

/**
 * WebSocket payload Message type
 */
export type Message = {
	path: Path;
	value: Json | undefined;
};

/**
 * WebSocket wrapper class and entry point
 */
export class WebSocketWrapper {
	// Connection store and readonly store
	private readonly connectionStore: Writable<boolean>;
	readonly connectionState: Readable<boolean>;

	// Backing object store
	private readonly objectStore: Writable<Json | undefined>;

	// Cached stores
	// (key is `path.join(".")`)
	private readonly webSocketStoreCache: Record<string, WebSocketStore<unknown>>;

	// Backing WebSocket connection
	private ws?: WebSocket;

	constructor(readonly serverUrl: string, readonly reconnectDelayMs: number = 10_000) {
		console.assert(this.serverUrl != null, "Unable to initialize WebSocketWrapper: 'serverUrl' must not be falsey!");

		// Create connection store and readonly store
		this.connectionStore = writable(false);
		this.connectionState = readonly(this.connectionStore);

		// Create object store
		this.objectStore = writable(undefined);

		// Create cache
		this.webSocketStoreCache = {};
	}

	start() {
		// Abort if WebSocket already opened
		if (this.ws?.readyState === WebSocket.OPEN) {
			console.info("[SWS] WebSocket already open");
			return;
		}

		// Start websocket
		console.info("[SWS] WebSocket starting...");
		this.ws = new WebSocket(this.serverUrl);

		// Initialize event listenters
		this.ws.onopen = event => {
			console.info("[SWS] WebSocket opened");

			// Set connection state to true
			this.connectionStore.set(true);
		}
		this.ws.onerror = event => {
			console.warn("[SWS] WebSocket errored:", event);
		};
		this.ws.onclose = event => {
			console.info(`[SWS] WebSocket closed: Reconnecting in ${this.reconnectDelayMs / 1000} seconds...`);

			// Set connection state to false
			this.connectionStore.set(false);

			// Execute after delay
			setTimeout(() => this.start(), this.reconnectDelayMs);
		};
		this.ws.onmessage = event => {
			let message: Message = JSON.parse(event.data);

			// Abort if path is null or undefined
			if (message.path == null) {
				return;
			}

			console.debug(`[SWS] Received update '${message.path}' = ${message.value}`);

			// Set value locally
			this.objectStore.update(obj => setAtPath(obj, message.path, message.value));
		};
	}

	/**
	 * Pseudo-constructor for {@link WebSocketStore}
	 * @param path Absolute path to value
	 * @param defaultValue Initial value of store; ignored if store already exists at given path
	 * @returns New store or existing store if one already exists at given path;
	 */
	webSocketStore<T extends Json = Json>(path: Path, defaultValue?: T): WebSocketStore<T | undefined> {
		// Path to string
		const pathString = path.join(".");

		// Check cache
		let webSocketStore = this.webSocketStoreCache[pathString];
		if (webSocketStore !== undefined) {
			// Return existing store
			return webSocketStore as WebSocketStore<T | undefined>;
		}

		// Else, create new store

		// Backing store
		const store = derivedFromPath(this.objectStore, path, defaultValue) as Writable<T | undefined>;

		// WebSocketStore implementation of set function
		const set = (value: T): void => {
			// Set locally first for better reactivity
			store.set(value);

			// Send update to websocket
			this.sendStoreValueUpdate(path, value);
		};

		// Add to cache and return
		return this.webSocketStoreCache[pathString] = {
			// Default subscribe function
			subscribe: store.subscribe,
			// WebSocketStore implementation of set function
			set,
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

	private sendStoreValueUpdate(path: Path, value: Json | undefined) {
		this.sendMessage({
			path: path,
			value: value,
		});
	}
};
