/*
    @copyright: 2022 Flying Pillow
    @author: ronb
    @date: 2022-11-03
    @description:
    This is the general api for accessing an object

    @type
        ```{
            success: boolean,
            message: string,
            data?: any,             // if success
            status: number,         // result of the jaseci api call
            statusText?: string,    // if not success
        }```
 */

import type { RequestEvent, RequestHandler } from './$types'
import { read, update, remove, getModel, errorResponse } from '$lib/server/factory'

export const GET: RequestHandler = async ({ params }: RequestEvent) => {
    try {
        const Class = getModel(params.model).Class;
        const obj = await read(Class, params.id, true);
        return new Response(JSON.stringify(obj.data));
    } catch (e) {
        return errorResponse(e, 404, `Error calling get api for ${params.model} ${params.id}`)
    }
}

export const POST: RequestHandler = async ({ request, params }: RequestEvent) => {

    const data = await request.json();

    try {

        const Class = getModel(params.model).Class;
        const obj = await read(Class, params.id);
        obj.update(data);
        return new Response(JSON.stringify(obj.data));

    } catch (e) { return errorResponse(e) }
}

export const DELETE: RequestHandler = async ({ params }: RequestEvent) => {
    try {
        const Class = getModel(params.model).Class;
        await remove(Class, params.id, true);
        return new Response(`Removed ${params.id}`);
    } catch (e) {
        return errorResponse(e, 404, `Error calling delete api for ${params.model} ${params.id}`)
    }
}

