import {Parts, PropInfo} from './types';

export function toParts(expr: string){
    const closedBraceSplit = expr.split('}');
    const parts: Parts = [];
    for(const cb of closedBraceSplit){
        if(cb.indexOf('{') > -1){
            const openBraceSplit = cb.split('{');
            parts.push(openBraceSplit[0]);
            const prop: PropInfo = {   }
            parts.push([openBraceSplit[1], prop]);
        }else{
            parts.push(cb);
        }
    }
    return parts;
}