import WebSocket from 'ws';
import * as alt from 'alt-server';
import fs from 'fs';

class WebsocketServer {
	constructor() {
		//init simple websocket server
		this.wss = new WebSocket.Server({ port: 8080 });
		this.wsPlayerMap = new Map();
		this.registerEvents();
	}

	registerEvents() {
		this.wss.on('connection', this.connection.bind(this));
		alt.on('playerDisconnect', (player) => {
			//cleanup websocket player map
			const playerId = player.id;
			if (!this.wsPlayerMap.has(playerId)) return;
			this.wsPlayerMap.delete(playerId);
		});
	}

	connection(ws, req) {
		if (
			!req.headers ||
			!req.headers.hasOwnProperty('authcode') ||
			!req.headers.hasOwnProperty('playerid')
		) {
			//kill connection if headers missing
			return ws.close();
		}
		const player = this.getPlayerForSocket(req.headers['playerid']);
		if (!player) return ws.close();
		console.log(
			'Websocket connection made for player ',
			player.name,
			player.id
		);
		//map ws to player ids for later gamemode communication
		this.wsPlayerMap.set(parseInt(req.headers['playerid']), ws);
		ws.player = player;
		ws.on('message', (data) => this.incomingMessage(data, ws));
	}

	incomingMessage(data, ws) {
		const parsedData = JSON.parse(data);
		if (parsedData && parsedData.eventName) {
			switch (parsedData.eventName) {
				case 'server:takeScreenshot':
					if (!parsedData.base64) return;
					this.saveScreenshot(parsedData.base64, ws.player.name, 0);
					return;
				case 'server:pedHeadshot':
					if (!parsedData.base64) return;
					this.saveScreenshot(parsedData.base64, ws.player.name, 1);
					return;
				case 'server:takeScreenshotGameOnly':
					if (!parsedData.base64) return;
					this.saveScreenshot(parsedData.base64, ws.player.name, 2);
					return;
				default:
					alt.log('WebsocketServer: unknown event', parsedData);
					return;
			}
		} else {
			console.log('msg: ', parsedData, ws.player.name);
		}
	}

	getPlayerForSocket(playerId) {
		return alt.Player.getByID(playerId);
	}

	getSocketForPlayerId(playerId) {
		return this.wsPlayerMap.get(playerId);
	}

	saveScreenshot(screenshotBase64String, playerName, type = 0) {
		const now = new Date();
		const time = now.toISOString().slice(11, 19).replace(':', '-');
		const time2 = time.replace(':', '-');
		const fileday = now.toISOString().slice(0, 10);
		const screenType = this.getScreenCaptureType(type);
		if (!screenType) {
			alt.log('unknown screentype detected', type);
			return;
		}
		const fileName =
			playerName + '_' + screenType + '_' + fileday + '_' + time2;

		fs.mkdir('screenshots', (err) => {
			if (err) {
				if (err.code === 'EEXIST') {
					return;
				} else {
					console.log(err);
					return;
				}
			}
			alt.log('Directory screenshots created successfully!');
		});

		fs.writeFile(
			`screenshots/${fileName}.png`,
			screenshotBase64String,
			'base64',
			function (err) {
				if (err) throw err;
				alt.log(`${screenType} saved!`);
			}
		);
	}

	getScreenCaptureType(type) {
		switch (type) {
			case 0:
				return 'screenshot_with_ui';
			case 1:
				return 'pedheadshot';
			case 2:
				return 'screenshot_without_ui';
			default:
				return null;
		}
	}
}

export const WebsocketServerInstance = new WebsocketServer();
