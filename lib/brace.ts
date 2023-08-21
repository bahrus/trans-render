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

export function getBounds(val: string, parts: Parts){
    const boundaries = [];
    let cursorPos = 0;
    for(const part of parts){
        switch(typeof part){
            case 'string':
                cursorPos = val.indexOf(part, cursorPos);
                boundaries.push([cursorPos, cursorPos + part.length]);
                cursorPos += part.length;
        }
    }
    return boundaries;
}