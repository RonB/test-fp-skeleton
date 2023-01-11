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
import { find, create, getModel, errorResponse } from '$lib/server/factory'

export const GET: RequestHandler = async ({ params }: RequestEvent) => {
    try {
        const Class = getModel(params.model).Class;
        const obj: any[] = await find(Class, {});
        return new Response(JSON.stringify(obj));
    } catch (e) {
        return errorResponse(e, 401, `Error calling get api for ${params.model}`)
    }
}

export const POST: RequestHandler = async ({ request, params }: RequestEvent) => {

    const data = await request.json();
    try {
        const Class = getModel(params.model).Class;
        const obj = await create(Class, data);
        return new Response(JSON.stringify(obj.data));
    } catch (e) {
        return errorResponse(e)
    }
}
