import { booleans, numbers, strings} from './store'

const SERVER_IP = "192.168.1.2";

class WebSocketWrapper {
    private ws: WebSocket;

    constructor() {
        console.log("Starting WebSocket...");
        this.ws = new WebSocket(`ws://${SERVER_IP}:50080`);
        this.initWebSocketListeners();
    }

    private async restart() {
        console.log("Restarting WebSocket...");
        this.ws = new WebSocket(`ws://${SERVER_IP}:50080`);
        this.initWebSocketListeners();
        await this.waitForConnectionAsync();
        console.log("Connected");
    }

    private initWebSocketListeners() {
        this.ws.onerror = event => {
            console.log("Websocket error:");
            console.log(event);
        };
        this.ws.onclose = event => {
            console.log("WebSocket closed: Reconnecting in 10 seconds...")
            setTimeout(() => this.restart(), 10_000);
        };
        this.ws.onmessage = event => {
            var payload = JSON.parse(event.data);
            switch(payload.type) {
                case "boolean": {
                    console.log(`remote boolean update ${payload.id} = ${payload.value}`);
                    booleans.get(payload.id).setLocally(Boolean(payload.value));
                    // remoteBooleanHandler(payload.id, Boolean(payload.value));
                    break;
                }
                case "integer": {
                    console.log(`remote integer update ${payload.id} = ${payload.value}`);
                    numbers.get(payload.id).setLocally(Number(payload.value));
                    // remoteIntegerHandler(payload.id, Number(payload.value));
                    break;
                }
                case "string": {
                    console.log(`remote string update ${payload.id} = ${payload.value}`);
                    strings.get(payload.id).setLocally(String(payload.value));
                    // remoteStringHandler(payload.id, String(payload.value));
                    break;
                }
            }
        };
    }

    waitForConnectionAsync() {
        return new Promise<void>(resolve => {
            if (this.ws.readyState !== this.ws.OPEN) {
                this.ws.addEventListener("open", () => resolve());
            } else {
                resolve();
            }
        });
    }

    get connected() {
        return this.ws.readyState === this.ws.OPEN;
    }

    sendBooleanValue(id: string, value: boolean) {
        console.log(`local boolean update ${id} = ${value}`);
        this.ws.send(`{"id":"${id}","type":"boolean","value":${Boolean(value)}}`);
    }

    sendNumberValue(id: string, value: number) {
        console.log(`local number update ${id} = ${value}`);
        this.ws.send(`{"id":"${id}","type":"integer","value":${Number(value)}}`);
    }

    sendStringValue(id: string, value: string) {
        console.log(`local string update ${id} = ${value}`);
        this.ws.send(`{"id":"${id}","type":"string","value":"${String(value)}"}`);
    }
}

export const webSocketWrapper = new WebSocketWrapper();
(async function() {
    await webSocketWrapper.waitForConnectionAsync();
    console.log("Connected");
})();

export function sendBooleanValue(id: string, value: boolean) {
    webSocketWrapper.sendBooleanValue(id, value);
}

export function sendNumberValue(id: string, value: number) {
    webSocketWrapper.sendNumberValue(id, value);
}

export function sendStringValue(id: string, value: string) {
    webSocketWrapper.sendStringValue(id, value);
}
