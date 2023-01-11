/**
 * Global server for puublishing and subscribing to a conversation
 * @remarks
 *
 * Instantiated at startup from the hooks.server.ts
 *
 */
import { WebSocket, WebSocketServer } from 'ws'
import type { MessageType } from '$lib/types';

class WebSocketWithId extends WebSocket {
    public id: string;
}

export class PubSubServer {

    private wss: WebSocketServer
    private subsByWsId = new Map<string, Subscription[]>()
    private subsByChannel = new Map<string, Subscription[]>();

    constructor() {
        // initialize the webssocket server
        // @todo: sveltekit websocket over same port not available
        // see: https://github.com/sveltejs/kit/issues/1491
        // workaround: https://joyofcode.xyz/using-websockets-with-sveltekit
        this.wss = new WebSocketServer({ port: 7001 })
        this.wss.on('connection', (ws: WebSocketWithId, request) => {

            ws.id = crypto.randomUUID();
            ws.on('close', () => {
                this.unsubscribeAllChannels(ws);
            });
            ws.on('message', (event) => {
                const message: MessageType = JSON.parse(event.toString())
                switch (message.type) {
                    case 'subscribe':
                        this.subscribe(message.channel, ws);
                        break;
                    case 'message':
                        this.publish(message, ws);
                        break;
                }
                console.log('on message pubsubserver', event.toString())
            })
        })
    }

    // publish the message to all channel subscribers except itself
    private publish(message: MessageType, ws: WebSocketWithId): void {
        const subs = this.subsByChannel.get(message.channel) || [];
        subs.forEach((sub: Subscription) => {
            if (ws !== sub.ws) {
                sub.ws.send(JSON.stringify(message));
            }
        })
    }

    // subscribe a new websocket to the requested channel
    private subscribe(channel: string, ws: WebSocketWithId): void {

        const sub = new Subscription(ws, channel);

        let subs = this.subsByChannel.get(channel);
        if (!subs) {
            this.subsByChannel.set(channel, [sub]);
        } else {
            subs.push(sub);
        }

        subs = this.subsByWsId.get(ws.id);
        if (!subs) {
            this.subsByWsId.set(ws.id, [sub])
        } else {
            subs.push(sub);
        }
    }

    /**
     * Unsubscribe all channels for one websocket
     */
    unsubscribeAllChannels(ws: WebSocketWithId): void {
        const ws_subs = this.subsByWsId.get(ws.id);
        if (ws_subs) {
            ws_subs.forEach((ws_sub => {
                let channel_subs = this.subsByChannel.get(ws_sub.channel);
                if (channel_subs) {
                    const index = channel_subs.indexOf(ws_sub)
                    channel_subs.splice(index, 1)
                    console.log('subsbychannel', channel_subs.length)
                }

            }))
            this.subsByWsId.delete(ws.id);
        }
    }
}

class Subscription {

    ws: WebSocket;
    channel: string;

    constructor(ws: WebSocket, channel: string) {
        this.ws = ws;
        this.channel = channel
    }

    send(message: string) {
        this.ws.send(message);
    }
}