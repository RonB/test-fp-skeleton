/**
 *  
 * # client factory functions
 * The factory contains generic functions to act on content objects.
 * 
 * ## create
 * Instantiate an object by passing the ModelClass, an optional id and a data object
 * 
*/
import type { ModelType } from '$lib/types';
import { ModelsByClass, ModelsByName, Entity, EntityModel } from '$lib/client/models';

export async function create<ModelClass extends Entity>(ModelClass: new (id: string, model: string, data: any) => ModelClass, rawData?: any): Promise<ModelClass> {
	const model = getModel(ModelClass);
	// store the data
	const response: any = await fetch(`/api/data/${model.name}`, {
		method: 'POST',
		body: JSON.stringify(rawData || {})
	})
	const data = await response.json();
	return new ModelClass(data.id, model.name, data);
}

export async function read<ModelClass extends Entity>(ModelClass: new (id: string, model: string, data: any) => ModelClass, id: string): Promise<ModelClass> {
	const modelName = ModelClass.name;
	// store the data
	const response: any = await fetch(`/api/data/${modelName}/${id}`)
	const data = await response.json();
	return new ModelClass(data.id, modelName, data);
}

// get the model by name or by class
export function getModel(param: any): ModelType {
	let model = typeof param == 'string' ?
		ModelsByName.get(param) :
		ModelsByClass.get(param);
	return model || EntityModel;
}