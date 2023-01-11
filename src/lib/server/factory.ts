/**
	# factory functions
	The factory contains generic functions to act on content objects.

	## create {@link#create}
	Instantiate an object by passing the ModelClass, an optional id and a data object

	## read {@link#read}
	Passing the modelclass and an id to the read function,
	the data is read from the database, the data is then parsed
	by the schema and the object is instantiated.

	## update {@link#update}
	Function used by the entity class to update data in the database

	## find {@link#find}
	Passing a modelclass and a query to the find function returns an array
	of content objects

	## validate {@link#validate}

*/

import { db } from '$lib/server/db'; // database driver
import { ModelsByName, ModelsByClass, Entity, EntityModel, Edge } from '$lib/server/models';
import type { ModelType } from '$lib/types';
import { z, ZodError } from 'zod';

/**
 * factory function to create entities based on a ModelClass
 * @param ModelClass 
 * @param rawData 
 * @returns Entity
 */
export async function create<ModelClass extends Entity>(ModelClass: new (id: string, model: string, data: any) => ModelClass, rawData?: any): Promise<ModelClass> {
	// if there is no default rawdata then create empty
	rawData = rawData || {}
	// the name of the model is derived form the Modelnames map
	const model = ModelsByClass.get(ModelClass);
	if (!model) {
		// todo ... generieke error afhandeling....
		throw { status: 500, message: 'Model not found' }
	}
	// generate a unique id and assign the modelname
	rawData.model = model.name;
	rawData.id = `${model.name}:⟨${crypto.randomUUID()}⟩`
	// before creation validate the data
	let data = validate(ModelClass, rawData);
	// create object in database
	await db.create(data.id, data);
	// create and return the new entity
	return new ModelClass(data.id, data.model, data);
}
/**
 * Reads an object fromn the database and returns an entity with the ModelClass
 * 
 * @param ModelClass 
 * @param id 	
 * Id of the entity
 * @param raw 	
 * If true will return the entity with the raw data from the database.
 * It will skip the validation of the data.
 * This is usefull in case of migration or repair of stored data
 * 
 * @returns Entity of class ModelClass
 */
export async function read<ModelClass extends Entity>(ModelClass: new (id: string, schema: string, data: any) => ModelClass, id: string, raw?: boolean): Promise<ModelClass> {

	const rawData = await db.select(id);
	let data: any;
	if (raw) {
		data = rawData[0];
	} else {
		data = validate(ModelClass, rawData[0]);
	}
	return new ModelClass(data.id, data.model, data);
}

/**
 * 
 * Validates and updates an object in the database with passed rawData
 * 
 * @param entity 
 * @param rawData boolean
 * @returns Updated Entity
 * @throws Error if not valid or not saved
 */
// @roy... nu is entity is type any...
// consider: move existing object to history for rollback?
export async function update<ModelClass extends Entity>(entity: ModelClass, rawData: any): Promise<Entity> {
	// validate the rawData
	const model = getModel(entity.data.model);
	// get the server data
	let data: any = await db.select(entity.data.id);
	// merge the new data to the existing data object
	Object.assign(data[0], rawData);
	// validate the merged data
	entity.data = validate(model.Class, data[0]);
	// store the data in the database
	await db.update(entity.data.id, entity.data);
	// return the valid entity
	return entity;
}

/**
 * Physically removes object from the database
 * 
 * @param ModelClass 
 * @param id 
 * @returns 
 * 
 */
// should we move it to a trash?
// what about edges or references?
export async function remove<ModelClass extends Entity>(ModelClass: new (id: string, model: string, data: any) => ModelClass, id: string): Promise<boolean> {
	await db.delete(id);
	return true
}
/**
 * relate function connects an entity to one or more entities by creating an edge
 * @param ModelClass a class that is or inherits from Edge
 * @param from 	identifies source entity
 * @param to 	identifies target entity or entities
 * @param data 	properties assigned to the data object of the edge
 * @returns result of the connection
 */
// relate is connecting two or more entities
// every relatonship is an edge based on a model class
export async function relate<ModelClass extends Edge>(ModelClass: new (id: string, model: string, data: any) => ModelClass, from: string, to: string, data?: any): Promise<ModelClass> {
	//data = validate(ModelClass, data || {});
	const content: string = JSON.stringify(data);
	let query = `RELATE ${from}->${ModelsByClass.get(ModelClass)}->${to} CONTENT ${content}`
	let response: any = await db.query(query)
	return response.result
}
/**
 * 
 * Validates data object and returns valid data
 * 
 * @param ModelClass 
 * @param data 
 * @returns valid data object or throws zod error
 */
export function validate<ModelClass extends Entity>(ModelClass: new (id: string, schema: string, data: any) => ModelClass, data: any): any {
	// get the model so the schema can be used to validate
	const model = getModel(ModelClass);
	// validate the data against the schema.
	return model.Schema.parse(data);
}
/**
 * find one or more entities in the database and return the validated json
 * 
 * @param ModelClass 
 * @param select_query 
 * 
 * object with 
 * 	 select {string} (defaults to *)
 *   from {string} )default to model name from the class
 *   where {object} specifying the condition for returning
 * 		field:string name of the field
 * 		value:string|number|date 
 * 
 * 
 * SELECT {select} FROM {model.name} WHERE {where}
 * 
 * 
  ```
  select(User, {
	select: 'name,id', 
	where: {
		field: 'email', 
		value: 'john_doe@acme.corp'
	}
  });
  ```
 * 
 * 
 * i.e.: SELECT name,id FROM User WHERE email = 'john.doe@acme.corp'
 * 
 * @returns array of ModelType objects based on the ModelClass
 */
import type { SelectQueryType } from '$lib/types';
export async function find<ModelClass extends Entity>(ModelClass: new (id: string, model: string, data: any) => ModelClass, select_query?: SelectQueryType): Promise<any[]> {

	const model = getModel(ModelClass);
	type ModelType = z.infer<typeof model.Schema>

	// default query is everything from the table
	let query = `SELECT * FROM ${model.name}`;
	if (typeof select_query == 'string') {
		query = select_query;
	} else if (select_query) {
		select_query.from = select_query.from || model.name;
		query = buildSelectQuery(select_query);
	}
	// get the data
	const results: ModelType[] = await db.query(query);
	// generate the valid data objects
	let result: ModelType[] = [];
	results[0].result.map((data: any) => {
		result.push(validate(ModelClass, data))
	});

	return result;
}
/**
 * find first entity based on a select
 * @param ModelClass 
 * @param select_query 
 * @returns 
 */
export async function findOne<ModelClass extends Entity>(ModelClass: new (id: string, model: string, data: any) => ModelClass, select_query?: SelectQueryType): Promise<any> {
	const result = await find(ModelClass, select_query);
	return result.length > 0 ? result[0] : null
}
/**
 * 
 * @param select_query 
 * @returns a string in SQL format
 */
export function buildSelectQuery(select_query: SelectQueryType): string {

	let query = 'SELECT ';
	if (!select_query.select) query += '*';
	if (typeof select_query.select === 'string') query += select_query.select;
	if (Array.isArray(select_query.select)) query += select_query.select.join(', ');

	query += ' FROM';
	if (!select_query.from) throw new Error('Invalid FROM clause. It must be a string or an array of strings.');

	if (typeof select_query.from === 'string') query += ' ' + select_query.from;
	if (Array.isArray(select_query.from)) query += ' ' + select_query.from.join(', ');

	switch (typeof select_query.where) {
		case 'undefined':
			if (!select_query.order_by && !select_query.fetch) return query;
			break;
		case 'string':
			// where is a string
			query += ' ' + select_query.where;
			break;
		case 'object':
			query += ' WHERE ';
			// where is an array of objects or a single object
			if (Array.isArray(select_query.where)) {
				for (let i = 0; i < select_query.where.length; i++) {
					const selection = select_query.where[i];
					let value = buildValue(selection.value);
					let clause = `${selection.operator_before || ''} ${selection.field} ${selection.operator || ' = '} ${value}`;
					if (i < select_query.where.length - 1) {
						clause += selection.operator_after || ' AND';
					}
					query += clause;
				}
			} else {
				let value = buildValue(select_query.where.value);
				query += `${select_query.where.field} ${select_query.where.operator || '='} ${value}`;
			}
			break;
	}

	if (select_query.fetch) {
		if (typeof select_query.fetch == 'string') query += ' FETCH ' + select_query.fetch;
		if (Array.isArray(select_query.fetch)) query += ' FETCH ' + select_query.fetch.join(', ');
	}

	if (!select_query.order_by) {
		return query;
	}

	query += ' ORDER BY';
	if (Array.isArray(select_query.order_by)) {
		for (let i = 0; i < select_query.order_by.length; i++) {
			const order = select_query.order_by[i];
			let clause = ` ${order.field} ${order.direction}`;
			if (i < select_query.order_by.length - 1) {
				clause += ',';
			}
			query += clause;
		}
	} else {
		query += ` ${select_query.order_by.field} ${select_query.order_by.direction}`;
	}

	return query;
}
/**
 * helperfumnction buildValue transforms the actual value to a string 
 * that can be used in the where clause of the quey
 * @param value 
 * @returns string to be used as the comparison value in the query
 */
function buildValue(value: number | string | Date | undefined): string {
	let v: string = '';
	switch (typeof value) {
		case 'number':
			v = `${value}`;
			break;
		case 'string':
			v = `"${value}"`
			break;
		case 'object':
			v = `'${value.toISOString()}'`
	}
	return v;
}

// get the model by name or by class
export function getModel(param: any): ModelType {
	let model = typeof param == 'string' ?
		ModelsByName.get(param) :
		ModelsByClass.get(param);
	return model || EntityModel;
}

// catching errors from api's returning a new http response
export function errorResponse(e: unknown, status?: number, statusText?: string) {
	statusText = statusText || 'Unknown error'
	status = status || 500
	let error = errorObject(e, statusText);
	return new Response(JSON.stringify(error), { status, statusText })
}

// catching errors returning an error object
export function errorObject(e: unknown, message?: string) {
	console.log(e);
	let error: any = {
		success: false,
		message: message || 'General error'
	}
	if (e instanceof ZodError) {
		error.message = e.flatten();
		error.fields = e.formErrors.fieldErrors
	}
	// @todo: store message in log??
	return error;
}
