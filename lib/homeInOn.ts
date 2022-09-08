import {isDefined, isResolved} from './isDefined.js';
export async function homeInOn(host: Element, path: string){
    await isDefined(host);
    const split = path.split('.');
    let returnObj = host as any;
    for(const token of split){
        const test = returnObj[token];
        if(test === undefined){
            if(returnObj instanceof EventTarget){
                await isResolved(returnObj);
            }
            returnObj = returnObj[token];
        }else{
            returnObj = test;
        }
        if(returnObj === undefined) return undefined;
    }
    return returnObj;
}

