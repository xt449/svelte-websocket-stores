import {setStoreBoolean, setStoreInteger, setStoreString} from './stores'

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
                    setStoreBoolean(payload.id, Boolean(payload.value));
                    remoteBooleanHandler(payload.id, Boolean(payload.value));
                    break;
                }
                case "integer": {
                    setStoreInteger(payload.id, Number(payload.value));
                    remoteIntegerHandler(payload.id, Number(payload.value));
                    break;
                }
                case "string": {
                    setStoreString(payload.id, String(payload.value));
                    remoteStringHandler(payload.id, String(payload.value));
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

    setBoolean(id: string, value: boolean) {
        console.log(`local boolean update ${id} = ${value}`);
        value = Boolean(value);
        setStoreBoolean(id, value);
        this.ws.send(`{"id":"${id}","type":"boolean","value":${value}}`);
    }

    setInteger(id: string, value: number) {
        console.log(`local integer update ${id} = ${value}`);
        value = Number(value);
        setStoreInteger(id, value);
        this.ws.send(`{"id":"${id}","type":"integer","value":${value}}`);
    }

    setString(id: string, value: string) {
        console.log(`local string update ${id} = ${value}`);
        value = String(value);
        setStoreString(id, value);
        this.ws.send(`{"id":"${id}","type":"string","value":"${value}"}`);
    }
}

export const webSocketWrapper = new WebSocketWrapper();
(async function() {
    await webSocketWrapper.waitForConnectionAsync();
    console.log("Connected");
    
    // Add listeners
    document.addEventListener("pointerdown", localPointerStart);
    document.addEventListener("pointerout", localPointerStop);
    document.addEventListener("pointerup", localPointerStop);
    // Duplicated by pointerout?
    // document.addEventListener("pointercancel", localPointerStop);
    document.addEventListener("click", localClick);
    document.addEventListener("change", localChange);
    document.addEventListener("input", localInput);
})()

// Local Listeners

/**
 * @param {PointerEvent} event 
 */
function localPointerStart(event: any) {
    console.log(`pointer start on ${event.target.tagName} #${event.target.id}`);

    if(event.target.id === "") {
        return;
    }

    if(event.target instanceof Element && event.target.matches("button, input[type=\"button\"]")) {
        webSocketWrapper.setBoolean(`${event.target.id}.press`, true);
    }
    // webSocketWrapper.setBoolean(`${event.target.id}.press`, true);
}

/**
 * @param {PointerEvent} event 
 */
function localPointerStop(event: any) {
    console.log(`pointer stop on ${event.target.tagName} #${event.target.id}`);
    
    if(event.target.id === "") {
        return;
    }

    if(event.target instanceof Element && event.target.matches("button, input[type=\"button\"]")) {
        webSocketWrapper.setBoolean(`${event.target.id}.press`, false);
    }
    // webSocketWrapper.setBoolean(`${event.target.id}.press`, false);
}

/**
 * @param {PointerEvent} event 
 */
function localClick(event: any) {
    console.log(`click on ${event.target.tagName} #${event.target.id}`);

    // Debug - Click is always duplicated by PointerStart and PointerStop unless the element is clicked without a pointer (ie: pressing Space while slected)
    return;
    
    if(event.target.id === "") {
        return;
    }

    if(event.target instanceof Element && event.target.matches("button, input[type=\"button\"]")) {
        webSocketWrapper.setBoolean(`${event.target.id}.press`, true);
        webSocketWrapper.setBoolean(`${event.target.id}.press`, false);
    }
}

/**
 * @param {Event} event 
 */
function localChange(event: any) {
    console.log(`change on ${event.target.tagName} #${event.target.id}`);
    
    if(event.target.id === "") {
        return;
    }

    if(event.target instanceof HTMLInputElement) {
        switch(event.target.type) {
            case "checkbox": {
                // .checked:Boolean
                webSocketWrapper.setBoolean(`${event.target.id}.value`, event.target.checked);
                break;
            }
            case "color": {
                // .value=#XXXXXX
                webSocketWrapper.setString(`${event.target.id}.value`, event.target.value);
                break;
            }
            case "date": {
                // .value=yyyy-mm-dd
                webSocketWrapper.setString(`${event.target.id}.value`, event.target.value);
                break;
            }
            case "datetime-local": {
                // .value=YYYY-MM-DDThh:mm
                webSocketWrapper.setString(`${event.target.id}.value`, event.target.value);
                break;
            }
            case "month": {
                // .value=yyyy-MM
                webSocketWrapper.setString(`${event.target.id}.value`, event.target.value);
                break;
            }
            case "number": {
                // .value:Number
                webSocketWrapper.setInteger(`${event.target.id}.value`, event.target.value);
                break;
            }
            case "range": {
                // .value:String
                webSocketWrapper.setInteger(`${event.target.id}.value`, Number(event.target.value));
                break;
            }
            case "time": {
                // .value=hh:mm:ss
                webSocketWrapper.setString(`${event.target.id}.value`, event.target.value);
                break;
            }
            default /*text*/: {
                // .value:String
                webSocketWrapper.setString(`${event.target.id}.value`, event.target.value);
                break;
            }
        }
    }
}

/**
 * @param {InputEvent} event 
 */
function localInput(event: any) {
    console.log(`input on ${event.target.tagName} #${event.target.id}`);
    
    if(event.target.id === "") {
        return;
    }

    // Debug - dont do this for things like checkboxes. keep this disabled for now
    return;
    
    webSocketWrapper.setBoolean(`${event.target.id}.value`, event.target.value);
}

// Remote Listeners

function remoteBooleanHandler(id: string, value: boolean) {
    console.log(`remote boolean update ${id} = ${value}`);
}

function remoteIntegerHandler(id: string, value: number) {
    console.log(`remote integer update ${id} = ${value}`);

    if(id.endsWith(".value")) {
        id = id.substring(0, id.length - 6);
    }
    id = id.replaceAll(".", "\\.");

    (document.querySelector(`#${id}`) as HTMLInputElement).value = String(value);
}

function remoteStringHandler(id: string, value: string) {
    console.log(`remote string update ${id} = ${value}`);
}
