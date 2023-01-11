import { browser } from "$app/environment";
import type { MessageType } from "$lib/types";
import type * as ServerWebSocket from "ws";
export class PubSubClient {

    //ws: WebSocket|ServerWebSocket.WebSocket;
    public ws: WebSocket | any;
    public channel: string;

    // connect a websocket to the PubSubServer
    // subscribe to the channel;
    constructor(channel: string, ws: WebSocket | ServerWebSocket.WebSocket) {
        this.channel = channel;
        this.ws = ws;
        // subscribe to the channel of this conversation
        this.subscribe();
    }

    private waitForOpenConnection() {
        return new Promise((resolve, reject) => {
            const maxNumberOfAttempts = 10
            const intervalTime = 200 //ms
            let currentAttempt = 0
            const interval = setInterval(() => {
                if (currentAttempt > maxNumberOfAttempts - 1) {
                    clearInterval(interval)
                    reject(new Error('Maximum number of attempts exceeded to wait for connection'))
                } else if (this.ws.readyState === this.ws.OPEN) {
                    clearInterval(interval)
                    resolve(true)
                }
                currentAttempt++
            }, intervalTime)
        })
    }

    private async subscribe(): Promise<boolean> {

        const message: MessageType = {
            type: 'subscribe',
            from: browser ? 'client' : 'server',
            channel: this.channel,
            created: new Date(),
            ready: false
        }

        if (this.ws.readyState !== this.ws.OPEN) {
            try {
                await this.waitForOpenConnection();
                return Promise.resolve(this.publish(message));
            } catch (err) {
                return Promise.resolve(false);
            }
        } else {
            return Promise.resolve(this.publish(message));
        }
    }

    // the user sends a message to the bot
    public publish(message: MessageType): boolean {
        if (this.ws.readyState == this.ws.OPEN) {
            message.channel = this.channel;
            this.ws.send(JSON.stringify(message));
            return true;
        } else {
            return false;
        }
    }
}