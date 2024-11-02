import {USL, protocols} from '../ts-refs/trans-render/XV/types.js';
import {get} from './get.js';
export async function grab(schema: {[key: string | number | symbol]: USL}){
    const returnObj: any = {};
    for(const key in schema){
        returnObj[key] = await get(schema[key]);
    }
    return returnObj;
}