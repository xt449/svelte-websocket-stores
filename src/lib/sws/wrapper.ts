import { get, readable, type Subscriber } from 'svelte/store';
import { booleans, logStoreIds, numbers, strings } from './store'

// Start of Config
const SERVER_IP = "192.168.1.2";
const LOCAL_ID = "tp1";
// End of Config

const GLOBAL_PREFIX = "global.";
const LOCAL_PREFIX = LOCAL_ID + ".";
const LOCAL_PREFIX_PLACEHOLDER = "local.";

class WebSocketWrapper {
	private ws?: WebSocket;
	private debug = true;
	private readonly booleanQueue: { [id: string]: boolean } = {};
	private readonly numberQueue: { [id: string]: number } = {};
	private readonly stringQueue: { [id: string]: string } = {};
	private setConnectionState?: Subscriber<boolean>;
	connectionState;

	constructor() {
		this.connectionState = readable(false, (set) => {
			this.setConnectionState = set;
		});

		// Force store setup
		get(this.connectionState);

		this.start();
	}

	private start() {
		if (this.ws?.readyState === WebSocket.OPEN) {
			return;
		}

		console.info("WebSocket starting");

		// Start networking
		this.ws = new WebSocket(`ws://${SERVER_IP}:50080`);

		// Init listenters
		this.ws.onopen = event => {
			console.info("WebSocket connected");
			this.setConnectionState!(true);

			if (this.debug) {
				this.debug = false;
				logStoreIds();
			}

			for (let [id, value] of Object.entries(this.booleanQueue)) {
				this.sendBooleanValue(id, value);
			}
			for (let [id, value] of Object.entries(this.numberQueue)) {
				this.sendNumberValue(id, value);
			}
			for (let [id, value] of Object.entries(this.stringQueue)) {
				this.sendStringValue(id, value);
			}
		}
		this.ws.onerror = event => {
			console.warn("WebSocket error:", event);
		};
		this.ws.onclose = event => {
			console.info("WebSocket closed: Reconnecting in 10 seconds...")
			this.setConnectionState!(false);
			setTimeout(() => this.start(), 10_000);
		};
		this.ws.onmessage = event => {
			let payload = JSON.parse(event.data);

			if (payload.id.startsWith(LOCAL_PREFIX)) {
				payload.id = LOCAL_PREFIX_PLACEHOLDER + payload.id.substring(LOCAL_PREFIX.length)
			} else if (!payload.id.startsWith(GLOBAL_PREFIX)) {
				return;
			}

			switch (payload.type) {
				case "boolean": {
					console.debug(`local<-remote boolean update ${payload.id} = ${payload.value}`);
					booleans.get(payload.id).setLocally(Boolean(payload.value));
					break;
				}
				case "number": {
					console.debug(`local<-remote number update ${payload.id} = ${payload.value}`);
					numbers.get(payload.id).setLocally(Number(payload.value));
					break;
				}
				case "string": {
					console.debug(`local<-remote string update ${payload.id} = ${payload.value}`);
					strings.get(payload.id).setLocally(String(payload.value));
					break;
				}
			}
		};
	}

	sendBooleanValue(id: string, value: boolean) {
		console.debug(`boolean update ${id} = ${value}`);

		// Add to queue if WebSocket closed
		if (this.ws?.readyState !== WebSocket.OPEN) {
			console.warn("WebSocket not connected. Adding to boolean queue");
			this.booleanQueue[id] = value;
			return;
		}

		// Prepend local id instead of placeholder
		if (id.startsWith(LOCAL_PREFIX_PLACEHOLDER)) {
			// Cut off period in prefix with `- 1`
			id = LOCAL_ID + id.substring(LOCAL_PREFIX_PLACEHOLDER.length - 1);
		}

		this.ws.send(`{"id":"${id}","type":"boolean","value":${Boolean(value)}}`);

		console.info(`local->remote boolean update ${id} = ${value}`);
	}

	sendNumberValue(id: string, value: number) {
		console.debug(`number update ${id} = ${value}`);

		// Add to queue if WebSocket closed
		if (this.ws?.readyState !== WebSocket.OPEN) {
			console.warn("WebSocket not connected. Adding to number queue");
			this.numberQueue[id] = value;
			return;
		}

		// Prepend local id instead of placeholder
		if (id.startsWith(LOCAL_PREFIX_PLACEHOLDER)) {
			// Cut off period in prefix with `- 1`
			id = LOCAL_ID + id.substring(LOCAL_PREFIX_PLACEHOLDER.length - 1);
		}

		this.ws.send(`{"id":"${id}","type":"number","value":${Number(value)}}`);

		console.info(`local->remote number update ${id} = ${value}`);
	}

	sendStringValue(id: string, value: string) {
		console.debug(`string update ${id} = ${value}`);

		// Add to queue if WebSocket closed
		if (this.ws?.readyState !== WebSocket.OPEN) {
			console.warn("WebSocket not connected. Adding to string queue");
			this.stringQueue[id] = value;
			return;
		}

		// Prepend local id instead of placeholder
		if (id.startsWith(LOCAL_PREFIX_PLACEHOLDER)) {
			// Cut off period in prefix with `- 1`
			id = LOCAL_ID + id.substring(LOCAL_PREFIX_PLACEHOLDER.length - 1);
		}

		this.ws.send(`{"id":"${id}","type":"string","value":"${String(value)}"}`);

		console.info(`local->remote string update ${id} = ${value}`);
	}
}

const instance = new WebSocketWrapper();

export const connected = instance.connectionState;

export function sendBooleanValue(id: string, value: boolean) {
	instance.sendBooleanValue(id, value);
}

export function sendNumberValue(id: string, value: number) {
	instance.sendNumberValue(id, value);
}

export function sendStringValue(id: string, value: string) {
	instance.sendStringValue(id, value);
}
