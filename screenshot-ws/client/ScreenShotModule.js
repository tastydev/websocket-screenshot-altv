import * as alt from 'alt-client';
import { WebsocketClientInstance } from './WebsocketModule.js';

class ScreenShotModule {
    constructor(){
        this.localPlayer = alt.Player.local;
        this.registerEvents();
    }

    registerEvents(){
        alt.on('keydown', this.handleKeydown.bind(this));
    }
    
    handleKeydown(key){
        if(key !== 116) return;
        //take screenshot
        this.takeScreenshotAndSendToServer();
    }

    async takeScreenshotAndSendToServer(){
        let base64Screenshot = await alt.takeScreenshot();
        if(!base64Screenshot) alt.log('screenshot failed');
        WebsocketClientInstance.sendData(['screenshot', base64Screenshot]);
    }
}

export const ScreenShotModuleInstance = new ScreenShotModule();
