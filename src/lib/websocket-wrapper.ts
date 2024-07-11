import { get, readable, type Readable, type Subscriber } from "svelte/store";
import { booleans, numbers, strings } from "./store.js";

const GLOBAL_ID_PREFIX = "global.";

class WebSocketWrapper {
	private config?: Configuration;
	private ws?: WebSocket;
	private setConnectionState?: Subscriber<boolean>;
	connectionState: Readable<boolean>;

	constructor() {
		this.connectionState = readable(false, (set) => {
			this.setConnectionState = set;
		});

		// Force store setup
		get(this.connectionState);
	}

	initialize(config: Configuration) {
		// Only run once
		if (this.config) {
			return;
		}

		this.config = config;

		this.start()
	}

	private start() {
		if (this.ws?.readyState === WebSocket.OPEN) {
			return;
		}

		console.info("[SWS] WebSocket starting...");

		// Start networking
		this.ws = new WebSocket(`ws://${this.config!.server_address}:50080`);

		// Init listenters
		this.ws.onopen = event => {
			console.info("[SWS] WebSocket opened");
			this.setConnectionState!(true);
		}
		this.ws.onerror = event => {
			console.warn("[SWS] WebSocket errored:", event);
		};
		this.ws.onclose = event => {
			console.info("[SWS] WebSocket closed: Reconnecting in 10 seconds...")
			this.setConnectionState!(false);
			
			setTimeout(() => this.start(), 10_000);
		};
		this.ws.onmessage = event => {
			let payload = JSON.parse(event.data);

			// Accept if prefixed by local or global ids
			if (payload.id.startsWith(this.config!.local_id_prefix)) {
				payload.id = payload.id.substring(this.config!.local_id_prefix.length)
			} else if (payload.id.startsWith(GLOBAL_ID_PREFIX)) {
				payload.id = payload.id.substring(GLOBAL_ID_PREFIX.length)
			} else {
				return;
			}

			switch (payload.type) {
				case "boolean": {
					console.debug(`[SWS] local<-remote boolean update ${payload.id} = ${payload.value}`);
					booleans.get(payload.id).setLocally(Boolean(payload.value));
					break;
				}
				case "number": {
					console.debug(`[SWS] local<-remote number update ${payload.id} = ${payload.value}`);
					numbers.get(payload.id).setLocally(Number(payload.value));
					break;
				}
				case "string": {
					console.debug(`[SWS] local<-remote string update ${payload.id} = ${payload.value}`);
					strings.get(payload.id).setLocally(String(payload.value));
					break;
				}
			}
		};

		// Keep (Not?) Alive
		setInterval(() => {
			if (this.ws?.readyState == WebSocket.OPEN) {
				this.ws?.send("{}");
			}
		}, 30_000);
	}

	sendBooleanValue(id: string, value: boolean) {
		// Abort if WebSocket undefined or not opened
		if (this.ws?.readyState !== WebSocket.OPEN) {
			return;
		}

		console.debug(`[SWS] local->remote boolean update ${id} = ${value}`);

		// Prepend local id prefix
		this.ws.send(`{"id":"${this.config!.local_id_prefix + id}","type":"boolean","value":${Boolean(value)}}`);
	}

	sendNumberValue(id: string, value: number) {
		// Abort if WebSocket undefined or not opened
		if (this.ws?.readyState !== WebSocket.OPEN) {
			return;
		}

		console.debug(`[SWS] local->remote number update ${id} = ${value}`);

		// Prepend local id prefix
		this.ws.send(`{"id":"${this.config!.local_id_prefix + id}","type":"number","value":${Number(value)}}`);
	}

	sendStringValue(id: string, value: string) {
		// Abort if WebSocket undefined or not opened
		if (this.ws?.readyState !== WebSocket.OPEN) {
			return;
		}

		console.debug(`[SWS] local->remote string update ${id} = ${value}`);

		// Prepend local id prefix
		this.ws.send(`{"id":"${this.config!.local_id_prefix + id}","type":"string","value":"${String(value)}"}`);
	}
}

const instance = new WebSocketWrapper();

export const connected = instance.connectionState;

// Singleton function export must be wrapped
export function initialize(config: Configuration) {
	instance.initialize(config);
}

// Singleton function export must be wrapped
export function sendBooleanValue(id: string, value: boolean) {
	instance.sendBooleanValue(id, value);
}

// Singleton function export must be wrapped
export function sendNumberValue(id: string, value: number) {
	instance.sendNumberValue(id, value);
}

// Singleton function export must be wrapped
export function sendStringValue(id: string, value: string) {
	instance.sendStringValue(id, value);
}

// Configuration

export type Configuration = {
	server_address: string,
	local_id_prefix: string,
}
