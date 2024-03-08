import { get, readable, type Readable, type Subscriber } from "svelte/store";
import { sendBooleanValue, sendNumberValue, sendStringValue } from "./wrapper";

// Type Hinting

type SubscriberWithID<V> = (id: string, value: V) => void;

interface WebSocketStore<V> extends Readable<V> {
    set(this: void, value: V): void;
    setLocally(this: void, value: V): void;
}

// Logic

/**
 * Pseudo-constructor for {@link WebSocketStore}
 * @param value Initial value
 */
function webSocketStore<V>(value: V, updateFunction: Subscriber<V>): WebSocketStore<V> {
    let setFunction: Subscriber<V>;

    /**
     * Backing readable store
     */
    let store = readable(value, (set: Subscriber<V>) => {
        setFunction = set;
    });

    // This calls the start function of the store just created.
    get(store);

    /**
     * Updates WebSocket
     */
    function set(value: V): void {
        // Set locally first for better reactivity
        setFunction(value);

        // Send to websocket
        updateFunction(value);
    }

    /**
     * Does not update WebSocket
     */
    function setLocally(value: V): void {
        setFunction(value);
    }

    return { ...store, set, setLocally };
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
}

// Export instances

export const booleans = new StoreDictionary<boolean>(false, sendBooleanValue);
export const numbers = new StoreDictionary<number>(0, sendNumberValue);
export const strings = new StoreDictionary<string>("", sendStringValue);
