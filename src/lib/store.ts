import { get, readable, writable, type Readable, type Subscriber } from "svelte/store";
import { sendBooleanValue, sendNumberValue, sendStringValue } from "./websocket-wrapper.js";

// Type Hinting

type SubscriberWithID<V> = (id: string, value: V) => void;

export interface WebSocketStore<V> extends Readable<V> {
	set(this: void, value: V): void;
	setLocally(this: void, value: V): void;
}

// Logic

/**
 * Pseudo-constructor for {@link WebSocketStore}
 */
function webSocketStore<V>(defaultValue: V, updateFunction: Subscriber<V>): WebSocketStore<V> {
	/**
	 * Backing store
	 */
	let store = writable(defaultValue);

	/**
	 * WebSocket implementation of set function
	 */
	function set(value: V): void {
		// Set locally first for better reactivity
		store.set(value);

		// Send to websocket
		updateFunction(value);
	}

	return {
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

/**
 * Dictionary-like class for binding to Svelte stores by IDs
 */
class StoreDictionary<V> {
	private backing: { [key: string]: WebSocketStore<V> } = {}
	private defaultValue: V;
	private updateFunction: SubscriberWithID<V>;

	constructor(defaultValue: V, updateFunction: SubscriberWithID<V>) {
		this.defaultValue = defaultValue;
		this.updateFunction = updateFunction;
	}

	/**
	 * Get Svelte store by ID
	 */
	get(id: string): WebSocketStore<V> {
		let store = this.backing[id];
		if (store === undefined) {
			store = this.backing[id] = webSocketStore(this.defaultValue, (value: V) => this.updateFunction(id, value));
		}
		return store;
	}

	get keys(): string[] {
		return Object.keys(this.backing);
	}
}

// Export instances

export const booleans = new StoreDictionary<boolean>(false, sendBooleanValue);
export const numbers = new StoreDictionary<number>(0, sendNumberValue);
export const strings = new StoreDictionary<string>("", sendStringValue);
