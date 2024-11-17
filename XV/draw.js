import { get } from './get.js';
export async function draw(schema) {
    const returnObj = {};
    for (const key in schema) {
        if (key.includes('://')) {
            returnObj[key] = await get(schema[key]);
        }
        else {
            returnObj[key] = schema[key];
        }
    }
    return returnObj;
}
