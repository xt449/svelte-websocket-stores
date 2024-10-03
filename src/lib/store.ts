import { writable, type Readable } from "svelte/store";
import { sendStoreValueUpdate } from "./websocket-wrapper.js";

/**
 * Svelte store that updates accross websocket interface with extra `setLocally` method for client-only reactivity when needed
 */
export interface WebSocketStore extends Readable<any> {
	/**
	 * Set value, inform subscribers, and send update over WebSocket.
	 * @param value to set
	 */
	set(this: void, value: any): void;
	/**
	 * Set value and inform subscribers.
	 * @param value to set
	 */
	setLocally(this: void, value: any): void;
}

/**
 * Global WebSocketStore dictionary
 */
const dictionary: { [key: string]: WebSocketStore } = {};

/**
 * Pseudo-constructor for {@link WebSocketStore}
 * @param path Store path
 * @param defaultValue Initial value of store; ignored if store already exists with given path
 * @returns New store or existing store if one already exists with given path;
 */
export function webSocketStore(path: string, defaultValue?: any): WebSocketStore {
	// Check if store already exists with given path
	let webSocketStore = dictionary[path];
	if (webSocketStore !== undefined) {
		// Return existing store
		return webSocketStore;
	}

	// Else, create new store

	/**
	 * Backing store
	 */
	let store = writable(defaultValue);

	/**
	 * WebSocketStore implementation of set function
	 */
	function set(value: any): void {
		// Set locally first for better reactivity
		store.set(value);

		// Send update to websocket
		sendStoreValueUpdate(path, value);
	}

	return dictionary[path] = {
		// Default subscribe function
		subscribe: store.subscribe,
		// WebSocketStore implementation of set function
		set,
		// Default set function
		setLocally: store.set
	};
}
