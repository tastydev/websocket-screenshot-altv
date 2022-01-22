process.on('unhandledRejection', (reason, promise) => {
	console.log(reason, promise);
});

process.on('uncaughtException', (err, origin) => {
	console.log(err, origin);
});

import { WsServerInstance } from './WebsocketModule.js';
