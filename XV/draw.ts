import {USL, protocols} from '../ts-refs/trans-render/XV/types.js';
import {get} from './get.js';
export async function draw(schema: {[key: string | number | symbol]: USL}){
    const returnObj: any = {};
    for(const key in schema){
        if(key.includes('://')){
            returnObj[key] = await get(schema[key]);
        }else{
            returnObj[key] = schema[key];
        }
        
    }
    return returnObj;
}