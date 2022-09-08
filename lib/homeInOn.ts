import {isDefined} from './isDefined.js';
export async function homeInOn(host: Element, path: string){
    await isDefined(host);
    const split = path.split('.');
    let idx = 1;
    let returnObj = host as any;
    for(const token of split){
        const test = returnObj[token];
        if(test === undefined){
            const {isResolved} = await import('./isResolved');
            await isResolved(host, split, idx);
            returnObj = returnObj[token];
        }else{
            returnObj = test;
        }
        if(returnObj === undefined) return undefined;
        idx++;
    }
    return returnObj;
}

