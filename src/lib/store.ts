import { writable, type Readable } from "svelte/store";
import { sendStoreValueUpdate } from "./websocket-wrapper.js";

/**
 * Svelte store that updates accross websocket interface with extra `setLocally` method for client-only reactivity when needed
 */
export interface WebSocketStore extends Readable<any> {
	set(this: void, value: any): void;
	setLocally(this: void, value: any): void;
}

/**
 * Global WebSocketStore dictionary
 */
const dictionary: { [key: string]: WebSocketStore } = {};

/**
 * Pseudo-constructor for {@link WebSocketStore}
 * @param id Identifier
 * @param defaultValue Initial value of store; ignored if store already exists with given id
 * @returns New or existing store if one already exists with given id;
 */
export function webSocketStore(id: string, defaultValue?: any): WebSocketStore {
	// Check if store already exists with given id
	let webSocketStore = dictionary[id];
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
		store.set(value);

		// Send update to websocket
		sendStoreValueUpdate(id, value);
	}

	return dictionary[id] = {
		/**
		 * Default subscribe function
		 */
		subscribe: store.subscribe,
		/**
		 * WebSocketStore implementation of set function
		 */
		set,
		/**
		 * Default set function
		 */
		setLocally: store.set
	};
}
