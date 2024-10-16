import {Parts, PropInfo} from '../ts-refs/trans-render/froop/types';

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
                if(part === '') continue;
                boundaries.push([cursorPos, cursorPos + part.length]);
                cursorPos += part.length;
        }
    }
    return boundaries;
}

export function getPartVals(val: string, parts: Parts){
    const boundaries = getBounds(val, parts);
    const vals = [];
    //let boundaryPlusOne: number[] = [];
    for(let i = 0, ii = boundaries.length; i < ii;  i++){
        const boundary = boundaries[i];
        if(boundary[0] > 0){

        }
        if(i === ii - 1){
            const start = boundary[1];
            vals.push(val.substring(start));
        }
        else{
            if(i === 0){
                if(boundary[0] > 0){
                    vals.push(val.substring(0, boundary[0]));
                }
            }
            const boundaryPlusOne = boundaries[i + 1];
            const start = boundary[1];
 
            const end = boundaryPlusOne[0];
            const betweenBoundaries = val.substring(start, end);
            vals.push(betweenBoundaries);
        }
        
    }

    return vals;
}

export function getParsedObject(val: string, parts: Parts){
    const partVals = getPartVals(val, parts);
    let cnt = 0;
    const parsedObject: any = {};
    for(const part of parts){
        switch(typeof part){
            case 'object':
                parsedObject[part[0]] = partVals[cnt];
                cnt++;
                break;

        }
    }
    return parsedObject;
}