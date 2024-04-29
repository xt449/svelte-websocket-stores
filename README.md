# Svelte WebSocket

DevOps: https://dev.azure.com/backrooms/SvelteWebSocket  
Git: https://backrooms@dev.azure.com/backrooms/SvelteWebSocket/_git/SvelteWebSocket  

### Overview
Svelte WebSocket is a collection of TypeScript files for managing the WebSocket client and specialized Svelte stores for interfacing with the WebSocket. It also includes several premade Svelte components that can be used in a project or just as examples.  
SWS also has a special component, `DisconnectedDialog.svelte`, which is a top-level element that shows when the WebSocket client loses connection with the WebSocket server.  

### WebSocket Data Fomat
The WebSocket server is on port 50080 by default.  
All the data sent across the WebSocket by the server and clients is sent as a string in the following JSON format: `{"type":"<type>","id":"<id>","value":<value>}` where `<type>` is one of `boolean`, `number`, or `string`; `<id>` is the identifier of the state variable; and `<value>` is the value of the corresponding type formatted in the JSON specification.  

### Server Implementations
There are two primary implementations of the SWS server in C# and Python.  
The C# server is intended to be used on Crestron processors, and the Python server is intended to be used on Extron processors.  

### Client Configuration
The SWS distribution contains a `sws.js` file which is used as the configuration.  
The `sever_ip` property sets the host IP of the server that the client will connect to.  
The `local_id_prefix` property sets the prefix that is prepended to all outgoing message IDs and is also used to check if incoming messages are to be read.  

### Client Deployment
The client is intended to be deployed to a Crestron touch panel that supports HTML 5.  
To package the files in the distribution folder to upload to a Crestron touch panel, use the `ch5-cli` command from the ch5-utilities-cli NPM package.  
