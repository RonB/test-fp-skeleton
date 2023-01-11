/*
    @copyright: 2022 Flying Pillow
    @author: ronb
    @date: 2022-11-03
    @description:
    General api for executing a method
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
import { read, getModel, errorResponse } from '$lib/server/factory'

export const POST: RequestHandler = async ({ request, params }: RequestEvent) => {

    const data = await request.json();

    try {

        const Class = getModel(params.model).Class;
        const obj: any = await read(Class, params.id);
        const result = obj[params.method](data);
        return new Response(JSON.stringify(result));

    } catch (e) { return errorResponse(e) }
}

