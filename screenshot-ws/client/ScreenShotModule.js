import * as alt from 'alt-client';
import * as game from 'natives';
import { WebsocketClientInstance } from './WebsocketModule.js';

class ScreenShotModule {
	constructor() {
		this.localPlayer = alt.Player.local;
		this.pedHeadshotAllowed = true;
		this.registerEvents();
	}

	registerEvents() {
		alt.on('keydown', this.handleKeydown.bind(this));
	}

	handleKeydown(key) {
		switch (key) {
			case 116: //take screenshot F5
				this.takeScreenshotAndSendToServer();
				return;
			case 115: //take ped headshot F4
				this.takePedHeadshotAndSendToServer();
				return;
			case 114: //take screenshot without cef F3
				this.takeScreenshotGameOnlyAndSendToServer();
				return;
			default:
				return;
		}
	}

	async takeScreenshotAndSendToServer() {
		try {
			const base64Screenshot = await alt.takeScreenshot();
			if (!base64Screenshot) {
				alt.log('screenshot failed');
				return;
			}
			WebsocketClientInstance.sendData({
				eventName: 'server:takeScreenshot',
				base64: base64Screenshot,
			});
		} catch (e) {
			alt.log(e);
		}
	}

	async takePedHeadshotAndSendToServer() {
		if (!this.pedHeadshotAllowed) return;
		this.pedHeadshotAllowed = false;
		try {
			const base64Headshot = await this.getPedHeadshotBase64();
			if (!base64Headshot) {
				alt.log('ped headshot failed');
				return;
			}
			WebsocketClientInstance.sendData({
				eventName: 'server:pedHeadshot',
				base64: base64Headshot,
			});
			this.pedHeadshotAllowed = true;
		} catch (e) {
			alt.log(e);
		}
	}

	async takeScreenshotGameOnlyAndSendToServer() {
		try {
			const base64Screenshot = await alt.takeScreenshotGameOnly();
			if (!base64Screenshot) {
				alt.log('screenshot gameonly failed');
				return;
			}
			WebsocketClientInstance.sendData({
				eventName: 'server:takeScreenshotGameOnly',
				base64: base64Screenshot,
			});
		} catch (e) {
			alt.log(e);
		}
	}

	getPedHeadshotBase64() {
		const hs = game.registerPedheadshot3(this.localPlayer.scriptID);
		return new Promise((res, rej) => {
			let tries = 0;
			let interval = alt.setInterval(() => {
				if (game.isPedheadshotReady(hs)) {
					const base64 = alt.getHeadshotBase64(hs);
					game.unregisterPedheadshot(hs);
					res(base64);
					alt.clearInterval(interval);
				} else if (tries > 30) {
					alt.log('ped headshot time exceeded before unregister');
					game.unregisterPedheadshot(hs);
					rej('ped headshot time exceeded');
					alt.clearInterval(interval);
				}
				tries++;
			}, 50);
		});
	}
}

export const ScreenShotModuleInstance = new ScreenShotModule();
