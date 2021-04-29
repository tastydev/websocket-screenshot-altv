import * as alt from 'alt-client';

class WebsocketClient {
    constructor(){
        this.localPlayer = alt.Player.local;
        //init websocket client
        this.wsClient = new alt.WebSocketClient('ws://127.0.0.1:8080');
        this.setupClient();
        this.registerEvents();
    }

    setupClient(){
        this.wsClient.addSubProtocol('appProtocol-v1');
        this.wsClient.addSubProtocol('appProtocol-v2');
        //this.wsClient.getSubProtocols() -> ['appProtocol-v1', 'appProtocol-v2']
        
        this.wsClient.setExtraHeader('authcode', 'random stuff');
        this.wsClient.setExtraHeader('playerid', this.localPlayer.id);
        //this.wsClient.getExtraHeaders() -> { authCode: 'random stuff', 'playerid': '12345' }
        
        // Optional heart beat, sent every 45 seconds when there is not any traffic
        // to make sure that load balancers do not kill an idle connection. (Set it to 0 to disable)
        this.wsClient.pingInterval = 45;
        
        this.wsClient.autoReconnect = false;
        this.wsClient.perMessageDeflate = true;
        //this.wsClient.readyState -> https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState

        this.wsClient.start();
    }
    
    registerEvents(){
        this.wsClient.on('open', () => {
            alt.log('WebSocket client connected')
            this.sendData('test payload');
        });
        this.wsClient.on('close', (code, reason) => alt.log('WebSocket client disconnected', code, reason));
        this.wsClient.on('error', reason => alt.log('WebSocket client error', reason));
        this.wsClient.on('message', this.incomingMessage.bind(this));
    }

    incomingMessage(data){
        alt.log('WebSocket client message', data)
    }

    sendData(data){
        if(this.wsClient.readyState !== 1) return;
        this.wsClient.send(JSON.stringify(data));
    }
}

export const WebsocketClientInstance = new WebsocketClient();
