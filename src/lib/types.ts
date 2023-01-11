/**
 * @author 		Ronald Brinkerink
 * 
 * This module exports all schema's and types for all entities.
 * These schemas and types can be used serverside and clientside.
 * 
 * # Model Schema
 * The schema is used to validate the data property for an entity object.
 * The data object persists in the database.
 * Currently the zod library is used to validate the content.
 * Make sure that you use snake case for fields. This is because rasa uses snake case for session_id etc.
 * 
 * # Model Type
 * The model type is the TypeScript type definition of the data object in an entity.
 * The type is exported by the zod infer function.
 * 
 */

import { z } from 'zod';
import type { Schema } from 'zod';

/**
 * Simple type schema's
 */
export const Id = z.string()
export const Model = z.string()
export const DateTime = z.preprocess((arg) => {
	if (typeof arg == "string" || arg instanceof Date) { return new Date(arg) } else { return arg }
}, z.date())
	.default(new Date()).transform((date: string | Date) => new Date(date))
/**
 * Types for functions and api's
 */
export const WhereSchema = z.object({
	operator_before: z.enum(["AND", "OR", "NOT", "AND NOT", "("]).optional(),
	field: z.string(),
	operator: z.enum(["=", "!=", "==", "?=", "*=", "<", ">", ">=", "<=", "IS", "IS NOT", "CONTAINS", "CONTAINSNOT", "CONTAINSALL", "CONTAINSNOMNE", "CONTAINSALL", "INSIDE", "OUTSIDE"]).optional(),
	value: z.union([z.string(), z.number(), DateTime]).optional(),
	operator_after: z.enum([")"]).optional()

})
export type WhereType = z.infer<typeof WhereSchema>
/**
  SelectQuerySchema:
  - select (optional): a string or an array of strings representing the fields to select in the query
  - from (optional): a string representing the table to select from in the query
  - where (optional): an object or an array of objects conforming to the WhereSchema shape
  - fetch (optional): a string or an array of strings representing the fields to fetch in the query
  - order_by (optional): a string or an array of strings representing the fields to order the results by in the query

	```
	const query = {
		select: '*',
		where: { field: 'name', operator: 'CONTAINS', value: 'KFC' },
		order_by: 'city',
	};
	findOne(Organization, query); // returns the value without any errors
	```
  */
const OrderBySchema = z.object({
	field: z.string(),
	direction: z.enum(['ASC', 'DESC']).optional()
})
export const SelectQuerySchema = z.object({
	select: z.union([z.string(), z.string().array()]).optional(),
	from: z.string().optional(),
	where: z.union([WhereSchema, WhereSchema.array()]).optional(),
	fetch: z.union([z.string(), z.string().array()]).optional(),
	order_by: z.union([OrderBySchema, OrderBySchema.array()]).optional(),
})
export type SelectQueryType = z.infer<typeof SelectQuerySchema>
/**
* Following schema definitions are used for the data objects in entities
*/

/**
 * @type	ModelType
 * 
 * ModelType describes the way how models are stored in the memory maps
 * ModelsByClass and ModelsByName.
 * ModelType defines models with name, Schema and Class
 * used by Models maps for client and server
 */
export type ModelType = {
	name: string,
	Schema: Schema,
	Class: any, // no public type for a Class
}
/**
 * @schema	EntitySchema
 * 
 * Describes the default schema of properties in the data object of each entity.
 * All other schema's inherit from this schema.
 */
export const EntitySchema = z.object({
	id: Id.default(''),
	model: Model.default(''),
	created: DateTime.optional(),
	authors: z.string().array().optional(),
	readers: z.string().array().optional()
})
export type EntityType = z.infer<typeof EntitySchema>

/**
 * @schema       Edge schema
 * 
 * Basesschema for all edges. An Edge connects two entity nodes.
 *
 * I.e. Organization -> Edge -> User
 * If you want to add properties to the edge then you define
 * a schema that inheits from Edge.
 * 
 * The schema Employee could be used that has properties about the employment, like start_date, job_title etc.
 * 
 * Organization -> Employee -> User
 * 
 * In case a two way description is needed:
 * 
 * Organization -> Employes -> User
 * User -> EmployedBy -> Organization
 * 
 */
export const EdgeSchema = EntitySchema.extend({
	from: z.string(),
	to: z.string(),
});
export type EdgeType = z.infer<typeof EdgeSchema>;

/**
 * @schema        Organization schema
 * 
 * Organization schema describes all properties of organizations 
 * that use this system.
 * 
 * @created      2022-12-03
 */
export const OrganizationSchema = EntitySchema.extend({
	name: z.string().optional(),
	type: z.string().optional(),
	image: z.string().optional()
})
export type OrganizationType = z.infer<typeof OrganizationSchema>

/**
 * @schema User schema
 * 
 * Schema for user information
*/
export const UserSchema = EntitySchema.extend(
	{
		name: z.string({ required_error: "Name is required" }),
		email: z
			.string({ required_error: "Email is required" })
			.email("Invalid email"),
		email_verified: z.boolean().default(false).optional(),
		password_hash: z.string().optional(),
		phone: z.string().optional(),
		image: z.string().optional(),
		role: z.enum(['user', 'admin']).default('user'),
	})

export type UserType = z.infer<typeof UserSchema>

/**
 * @schema Credentials schema
 * 
 * Schema for user credentials
*/
export const UserCredentialsSchema = z.object({
	email: z
		.string({ required_error: "Email is required" })
		.email("Invalid email"),
	password: z
		.string()
})
export type CredentialsType = z.infer<typeof UserCredentialsSchema>

/**
 * @schema Register schema
 * 
 * Schema for registering a new user
*/
export const UserRegisterSchema = z.object({
	email: z.string().email(),
	name: z.string({
		required_error: "Name is required"
	}),
	password: z
		.string({
			required_error: "Password is required"
		})
		.min(8, "Password must be more than 8 characters")
		.max(32, "Password must be less than 32 characters"),
	password_confirm: z
		.string({
			required_error: "Please confirm your password",
		}),
}).refine((data) => data.password === data.password_confirm, {
	path: ["password_confirm"],
	message: "Passwords do not match",
})
export type RegisterType = z.infer<typeof UserRegisterSchema>

/**
 * @schema       Session schema
 * @created      2022-11-05
 *
 * A session for an interactive connection to the application
 * 
*/
export const SessionSchema = EntitySchema.extend({
	sessionToken: z.string(),
	userId: z.string(),
	user_agent: z.string().optional(),
	host: z.string().optional(),
	origin: z.string().optional(),
	expires: DateTime.optional(),
	User: UserSchema.optional()
})

export type SessionType = z.infer<typeof SessionSchema>

/**
 * @schema		Account
 * @created		2022-12-28
 *
 * The Account model is for information about OAuth
 * accounts associated with a User.
 * It will contain access_token, id_token and other OAuth specific data.
 */
export const AccountSchema = EntitySchema.extend({
	userId: z.string(),
	type: z.string(),
	provider: z.string(),
	providerAccountId: z.string(),
	refresh_token: z.string().optional(),
	access_token: z.string().optional(),
	expires_at: DateTime,
	token_type: z.string().optional(),
	scope: z.string().optional(),
	id_token: z.string().optional(),
	session_state: z.string().optional(),
	oauth_token_secret: z.string().optional(),
	oauth_token: z.string().optional(),
	User: UserSchema.optional()
});

export type AccountType = z.infer<typeof AccountSchema>;

/**
 * @schema       	Conversation
 * @created      	2022-11-26
 *
 * Connecting chatbot to chat agent
 * Messages in  the conversation are seperately typed
 * This way we can typesafe exchange messages
 * The conversation connects to the local pubsub server
 *
 * */
export const MessageSchema = z.object({
	type: z.string(),
	channel: z.string(),
	text: z.string().optional(),
	image: z.string().optional(),
	video: z.string().optional(),
	link: z.string().optional(),
	buttons: z.object({
		title: z.string(),
		payload: z.string()
	}).array().optional(),
	from: z.string(),
	created: DateTime,
	ready: z.boolean()
})

export type MessageType = z.infer<typeof MessageSchema>;

// the conversation schema defuines al messages
export const ConversationSchema = EntitySchema.extend({
	messages: MessageSchema.array().default([])
});

export type ConversationType = z.infer<typeof ConversationSchema>;

/*=====================================================
 @model        Content model
 @description  Content with html or other type of content
 @author       RonB
 @created      2022-01-10
=======================================================*/
export const ContentSchema = EntitySchema.extend({
	content: z.string().optional(),
	category: z.string().optional(),
	title: z.string().optional(),
	content_type: z.string().optional(),
	history: z.string().array().optional()
})

export type ContentType = z.infer<typeof ContentSchema>;

