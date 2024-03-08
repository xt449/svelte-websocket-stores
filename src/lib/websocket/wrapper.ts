import { get, readable, type Subscriber } from 'svelte/store';
import { booleans, numbers, strings } from './store'

const SERVER_IP = "192.168.1.2";

class WebSocketWrapper {
    private ws?: WebSocket;
    private readonly booleanQueue: { [id: string]: boolean} = {};
    private readonly numberQueue: { [id: string]: number} = {};
    private readonly stringQueue: { [id: string]: string} = {};
    private setConnectionState?: Subscriber<boolean>;
    connectionStore;

    constructor() {
        this.connectionStore = readable(false, (set) => {
            this.setConnectionState = set;
        });

        // Force store setup
        get(this.connectionStore);

        this.start();
    }

    private start() {
        if(this.ws?.readyState === WebSocket.OPEN) {
            return;
        }

        console.info("WebSocket starting");

        // Start networking
        this.ws = new WebSocket(`ws://${SERVER_IP}:50080`);
        
        // Init listenters
        this.ws.onopen = event => {
            console.info("WebSocket connected");
            this.setConnectionState!(true);

            for(let [id, value] of Object.entries(this.booleanQueue)) {
                this.sendBooleanValue(id, value);
            }
            for(let [id, value] of Object.entries(this.numberQueue)) {
                this.sendNumberValue(id, value);
            }
            for(let [id, value] of Object.entries(this.stringQueue)) {
                this.sendStringValue(id, value);
            }
        }
        this.ws.onerror = event => {
            console.info("WebSocket error:");
            console.error(event);
        };
        this.ws.onclose = event => {
            console.info("WebSocket closed: Reconnecting in 10 seconds...")
            this.setConnectionState!(false);
            setTimeout(() => this.start(), 10_000);
        };
        // This could be initialized only once WebSocket "open" event is triggered
        this.ws.onmessage = event => {
            let payload = JSON.parse(event.data);
            switch (payload.type) {
                case "boolean": {
                    console.debug(`remote boolean update ${payload.id} = ${payload.value}`);
                    booleans.get(payload.id).setLocally(Boolean(payload.value));
                    break;
                }
                case "integer": {
                    console.debug(`remote integer update ${payload.id} = ${payload.value}`);
                    numbers.get(payload.id).setLocally(Number(payload.value));
                    break;
                }
                case "string": {
                    console.debug(`remote string update ${payload.id} = ${payload.value}`);
                    strings.get(payload.id).setLocally(String(payload.value));
                    break;
                }
            }
        };
    }

    sendBooleanValue(id: string, value: boolean) {
        console.debug(`local boolean update ${id} = ${value}`);

        if(this.ws?.readyState !== WebSocket.OPEN) {
            console.warn("WebSocket not connected. Adding to boolean queue");
            this.booleanQueue[id] = value;
            return;
        }

        this.ws.send(`{"id":"${id}","type":"boolean","value":${Boolean(value)}}`);
    }

    sendNumberValue(id: string, value: number) {
        console.debug(`local number update ${id} = ${value}`);

        if(this.ws?.readyState !== WebSocket.OPEN) {
            console.warn("WebSocket not connected. Adding to number queue");
            this.numberQueue[id] = value;
            return;
        }

        this.ws.send(`{"id":"${id}","type":"integer","value":${Number(value)}}`);
    }

    sendStringValue(id: string, value: string) {
        console.debug(`local string update ${id} = ${value}`);

        if(this.ws?.readyState !== WebSocket.OPEN) {
            console.warn("WebSocket not connected. Adding to string queue");
            this.stringQueue[id] = value;
            return;
        }

        this.ws.send(`{"id":"${id}","type":"string","value":"${String(value)}"}`);
    }
}

const instance = new WebSocketWrapper();

export const connected = instance.connectionStore;

export function sendBooleanValue(id: string, value: boolean) {
    instance.sendBooleanValue(id, value);
}

export function sendNumberValue(id: string, value: number) {
    instance.sendNumberValue(id, value);
}

export function sendStringValue(id: string, value: string) {
    instance.sendStringValue(id, value);
}
