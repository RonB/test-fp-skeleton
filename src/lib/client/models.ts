/*=========================================
    Client side model definitions
===========================================*/

export const ModelsByName = new Map<string, ModelType>()
export const ModelsByClass = new Map<any, ModelType>()

import { type EntityType, type ModelType, EntitySchema } from "$lib/types";

// client side classes
export abstract class Entity {

    public data: EntityType

    constructor(id: string, model: string, data: EntityType) {
        // set the data property
        this.data = data
        this.data.id = data.id || id
        this.data.model = data.model || model
    }
}
export const EntityModel = { name: 'Entity', Schema: EntitySchema, Class: Entity };

// Client Conversation class
import { type MessageType, type ConversationType, ConversationSchema } from "$lib/types";
import { PubSubClient } from "$lib/PubSubClient";
import { writable } from 'svelte/store';

export class Conversation extends Entity {

    public data: ConversationType; // conversation id
    // speech synthesizer
    private synth: SpeechSynthesis;
    // connection to the pubsub server
    public connection: PubSubClient;
    // channel is the current conversation id    
    private channel: string;
    // writable store to make object reactive
    private _store;

    constructor(id: string, model: string, data: ConversationType) {

        super(id, model, data)
        this.data = data

        // the store object is reactive with the svelte component
        this._store = writable(this);

        // instantiate speech
        this.synth = window.speechSynthesis;

        // set the channel to the current id
        this.channel = id;
    }

    public async connect(host: string) {
        return new Promise((resolve, reject) => {
            const ws = new WebSocket(`ws://${host}`);
            this.connection = new PubSubClient(this.channel, ws);
            ws.onmessage = this.onmessage;
            ws.onopen = resolve;
            ws.onerror = reject;
        });
    }

    // the user sends a message to the bot
    public send = (text: string): MessageType => {

        const message: MessageType = {
            type: 'message',
            channel: this.channel,
            from: 'client',
            text: text,
            created: new Date(),
            ready: false
        }

        this.data.messages.push(message);

        if (this.connection.publish(message)) {
            message.ready = true
            return message;
        } else {
            message.text = message.text + '\nOops... could not send message.'
            return message;
        }
    }

    public onmessage = (event: MessageEvent) => {

        const message = JSON.parse(event.data);
        this.data.messages.push(message);

        console.log('receive on client', message);

        // notify store that messages have changed
        this._store.set(this);

        // read message out loud in the client
        const speech = new SpeechSynthesisUtterance(message.text);
        speech.voice = this.synth.getVoices()[12];
        speech.lang = 'nl'
        this.synth.speak(speech);
    }

    // subscribe is a function for sveltekit to treat this conversation as a store
    public subscribe(subscriber: any) {
        return this._store.subscribe(subscriber);
    }
}

export const ConversationModel: ModelType = { name: 'Conversation', Schema: ConversationSchema, Class: Conversation };
ModelsByName.set('Conversation', ConversationModel);
ModelsByClass.set(Conversation, ConversationModel);