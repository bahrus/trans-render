import {isDefined} from './isDefined.js';
import {getVal} from './getVal.js';
export async function homeInOn(host: Element, path: string, resolvedEventPath?: string){
    await isDefined(host);
    let returnObj = await getVal({host}, path);
    if(returnObj !== undefined) return returnObj;
    if(resolvedEventPath !== undefined){
        const {waitForEvent} = await import('./isResolved.js');
        await waitForEvent(host, resolvedEventPath);
        return await getVal({host}, path);
    }else{
        returnObj = getVal({host}, path, 50);
        return returnObj;
    }
}



