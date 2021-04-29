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
	}

	connection(ws, req) {
		if (
			!req.headers ||
			!req.headers.hasOwnProperty('authcode') ||
			!req.headers.hasOwnProperty('playerid')
		) {
			//kill connection if headers missing
			ws.close();
		}
		const player = this.getPlayerForSocket(req.headers['playerid']);
		if (!player) ws.close();
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
				case 'screenshot':
					if (!parsedData.base64) return;
					this.saveScreenshot(parsedData.base64, ws.player.name);
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

	saveScreenshot(screenshotBase64String, playerName) {
		const now = new Date();
		const time = now.toISOString().slice(11, 19).replace(':', '-');
		const time2 = time.replace(':', '-');
		const fileday = now.toISOString().slice(0, 10);
		const fileName = playerName + fileday + '_' + time2;
		fs.mkdir('screenshots', (err) => {
			if (err) {
				if (err.code === 'EEXIST') {
					return;
				} else {
					console.log(err);
				}
			}
			console.log('Directory screenshots created successfully!');
		});

		fs.writeFile(
			`screenshots/${fileName}.png`,
			screenshotBase64String,
			'base64',
			function (err) {
				if (err) throw err;
				console.log('Screenshot saved!');
			}
		);
	}
}

export const WebsocketServerInstance = new WebsocketServer();
