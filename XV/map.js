import { get } from './get.js';
export async function map(schema) {
    const returnObj = {};
    for (const key in schema) {
        returnObj[key] = await get(schema[key]);
    }
    return returnObj;
}
