/**
 * 	
 * @author Ronald Brinkerink	
 * @description	Factory serverside
 * @created 2022-12-03
 * 	
 * This module exports all serverside models for this application.
 * It also exports the model maps used by the factory to access schema and model
 * 	
 * # Model	
 * A model contains the name of the model, the class definition, 
 * and a data validation schema that also generates a typescript type definition.
 * 	
 * ## Model Class	
 * The model class extends the abstract Entity class.	
 * An entity object is instantiated based on the model class.	
 * The factory design pattern is used to instantiate entities.	
 * These classes are serverside classes. In the lib/client folder the same classes	
 * are defined for the client operations.	
 * 	
 */
import { update, errorResponse } from '$lib/server/factory'

/**
 * Model maps with ModelSchemas en ModelClasses
 * Lists all Schemas and Classes so we can get them by name and by class
 */
import type { ModelType } from '$lib/types';
export const ModelsByName = new Map<string, ModelType>()
export const ModelsByClass = new Map<any, ModelType>()

/**
 * The Entity class is the abstract base class for all entities
 *
 * To create a new model:
 *		1. A schema with all properties and their validations
 *		2. A class that extends the Content base class that defines new funtions
 *		3. Add the model to the Models map
 *
 *		Use a snippet to create a new model by typing fp-ml
*/
import { type EntityType, EntitySchema } from '$lib/types'
export abstract class Entity {

	public data: EntityType

	constructor(id: string, model: string, data: EntityType) {

		// set the data property
		this.data = data
		this.data.id = data.id || id
		this.data.model = data.model || model

	}

	// update the data in the database
	public update = async (data: EntityType) => {
		await update(this, data);
	}

}

export const EntityModel = { name: 'Entity', Schema: EntitySchema, Class: Entity };

/**
 * @model        Edge model
 * @description  edges two entities
 * @author       RonB
 * @created      2022-12-12
 */
import { type EdgeType, EdgeSchema } from '$lib/types';
export class Edge extends Entity {

	data: EdgeType;

	constructor(id: string, model: string, data: EdgeType) {
		super(id, model, data)
		this.data = data;
	}
}

export const EdgeModel = { name: 'Edge', Schema: EdgeSchema, Class: Edge };
ModelsByName.set('Edge', EdgeModel);
ModelsByClass.set(Edge, EdgeModel);

/**
 * @model        Organization model
 * @description  Organization
 * @author       author
 * @created      created
*/
import { type OrganizationType, OrganizationSchema } from '$lib/types';
export class Organization extends Entity {
	data: OrganizationType;

	constructor(id: string, model: string, data: OrganizationType) {
		super(id, model, data)
		this.data = data
	}
}
export const OrganizationModel: ModelType = { name: 'Organization', Schema: OrganizationSchema, Class: Organization };
ModelsByName.set('Organization', OrganizationModel)
ModelsByClass.set(Organization, OrganizationModel);

/**
 * @model 		User model
 * @description	Describes all properties of a User
 * 
 * The user is registered in the database and can be 
 * authorized to the system thru registration or via oauth providers.
 */
import { type UserType, UserSchema } from '$lib/types';
export class User extends Entity {

	data: UserType

	constructor(id: string, model: string, data: UserType) {
		super(id, model, data)
		this.data = data
	}
}

export const UserModel: ModelType = { name: 'User', Schema: UserSchema, Class: User };
ModelsByName.set('User', UserModel)
ModelsByClass.set(User, UserModel);

/**
 * @model        Session model
 * @description  A session for an interactive connection to the application
 * @author       RonB
 * @created      2022-11-05
 */
import { type SessionType, SessionSchema } from '$lib/types';
export class Session extends Entity {

	data: SessionType

	constructor(id: string, model: string, data: SessionType) {
		super(id, model, data)
		this.data = data
	}
}

export const SessionModel: ModelType = { name: 'Session', Schema: SessionSchema, Class: Session };
ModelsByName.set('Session', SessionModel)
ModelsByClass.set(Session, SessionModel);

/**
 * @model		Account model
 * @description	The Account model is for information about OAuth
 *				accounts associated with a User.
 *				It will contain access_token, id_token and other OAuth specific data.
 * @created		2022-12-28
 */

import { type AccountType, AccountSchema } from '$lib/types';
export class Account extends Entity {
	data: AccountType;

	constructor(id: string, model: string, data: AccountType) {
		super(id, model, data)
		this.data = data;
	}
}

export const AccountModel: ModelType = { name: 'Account', Schema: AccountSchema, Class: Account };
ModelsByName.set('Account', AccountModel);
ModelsByClass.set(Account, AccountModel);

/**
 * @model        	Conversation model
 * @description  	Conversation class for storing
 * 					conversations and connecting to chat agent
 * 					Messages in  the conversation are seperately typed
 * 					This way we can tyapesafe exchange messages
 * 					The conversation connects to the local pubsub server
 * @created      	2022-11-26
 */

import { type ConversationType, ConversationSchema, type MessageType } from '$lib/types';
import WebSocket from 'ws';
import { PubSubClient } from '$lib/PubSubClient'
import { RASA_HOST } from '$env/static/private';

export class Conversation extends Entity {

	data: ConversationType;
	connection: PubSubClient;
	channel: string;

	constructor(id: string, model: string, data: ConversationType) {

		super(id, model, data);
		this.data = data;
		this.data.messages = [];
		this.channel = this.data.id || '';

		// Automatically connects to the channel of this Conversation
		this.connect('localhost:7001')
	}

	public async connect(host: string) {
		return new Promise((resolve, reject) => {
			const ws = new WebSocket(`ws://${host}`);
			this.connection = new PubSubClient(this.channel, ws);
			ws.on('open', resolve);
			ws.on('error', reject);
			ws.onmessage = (event => { this.onmessage(event) })
		});
	}

	// when a message is received pass it to the chatbot and return response to the user
	public onmessage(event: any) {
		const message = JSON.parse(event.data);
		console.log('message from client', message)
		// ugly... uitzoeken hoe dit moet... db kant, zod kant
		message.created = new Date(message.created)
		this.data.messages.push(message);
		this.respond(message);
	}

	private async respond(message: MessageType) {
		try {
			const result = await fetch(`${RASA_HOST}/webhooks/rest/webhook`, {
				method: 'POST',
				body: JSON.stringify({
					message: message.text,
					sender: this.data.id
				})
			})
			const responses = await result.json();
			console.log(JSON.stringify(responses))
			responses.map((response: any) => {
				const bot_response: MessageType = {
					type: 'message',
					from: 'bot',
					created: new Date(),
					channel: this.channel,
					text: response.text,
					image: response.image,
					buttons: response.buttons,
					ready: true
				}
				this.send(bot_response);
				this.data.messages.push(bot_response);
			})
			await this.update(this.data);
			return new Response()
		} catch (e) {
			return errorResponse(e);
		}
	}

	public send(message: MessageType): boolean {
		return this.connection.publish(message);
	}
}

export const ConversationModel: ModelType = { name: 'Conversation', Schema: ConversationSchema, Class: Conversation };
ModelsByName.set('Conversation', ConversationModel);
ModelsByClass.set(Conversation, ConversationModel);

/**
 * @model        	Content model
 * @description  	Content class for storing pages
 * @created      	2023-01-10 
 * 
 */
import { type ContentType, ContentSchema } from '$lib/types';
export class Content extends Entity {
	data: ContentType;
	constructor(id: string, model: string, data: ContentType) {
		super(id, model, data)
		this.data = data;
	}
}

export const PageModel: ModelType = { name: 'Content', Schema: ContentSchema, Class: Content };
ModelsByName.set('Content', PageModel);
ModelsByClass.set(Content, PageModel);