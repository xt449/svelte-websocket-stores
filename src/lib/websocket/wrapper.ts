import { get, readable, type Subscriber } from 'svelte/store';
import { booleans, numbers, strings } from './store'

const SERVER_IP = "192.168.1.2";

class WebSocketWrapper {
    private ws?: WebSocket;
    private readonly outboundQueue: string[] = [];
    private setConnectionState?: Subscriber<boolean>;
    connectionStore;

    constructor() {
        this.connectionStore = readable(false, (set) => {
            this.setConnectionState = set;
        });

        // Force store setup
        get(this.connectionStore);
    }

    start() {
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
            let message;
            let length = this.outboundQueue.length;
            for(let i = 0; i < length; i++) {
                message = this.outboundQueue.pop();
                if(message) {
                    this.queueSend(message);
                }
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

    private queueSend(message: string) {
        if(this.ws?.readyState !== WebSocket.OPEN) {
            console.warn("WebSocket not connected. Adding message to cache");
            this.outboundQueue.push(message);
            return;
        }

        this.ws!.send(message);
    }

    sendBooleanValue(id: string, value: boolean) {
        console.debug(`local boolean update ${id} = ${value}`);
        this.queueSend(`{"id":"${id}","type":"boolean","value":${Boolean(value)}}`);
    }

    sendNumberValue(id: string, value: number) {
        console.debug(`local number update ${id} = ${value}`);
        this.queueSend(`{"id":"${id}","type":"integer","value":${Number(value)}}`);
    }

    sendStringValue(id: string, value: string) {
        console.debug(`local string update ${id} = ${value}`);
        this.queueSend(`{"id":"${id}","type":"string","value":"${String(value)}"}`);
    }
}

const instance = new WebSocketWrapper();
instance.start();

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
