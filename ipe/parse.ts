import { IPE, asOptions } from "../ts-refs/trans-render/dss/types";
import { splitOnce } from "../lib/splitOnce.js";
export function parse(s: string) : IPE {
    const [nonAsPart, asOrUndefined] = splitOnce(s, ' as ');
    const [nonEvtPart, evtName] = splitOnce(nonAsPart, '::');
    const [id, propPath] = splitOnce(nonEvtPart, '?.');
    let revisedID = id as string | undefined;
    let constVal = undefined;
    if(id.startsWith('`') && id.endsWith('`')){
        constVal = id.substring(1, id.length - 1);
        revisedID = undefined;
    }else if(id.startsWith('#')){
        revisedID = id.substring(1);
    }else{
        revisedID = undefined;
    }
    let prop: string | undefined;
    let path: string | undefined;
    if(propPath !== undefined){
        [prop, path] = splitOnce(propPath, '?.');
    }
    
    return {
        id: revisedID,
        path,
        prop,
        evtName,
        as: asOrUndefined as asOptions,
        constVal,
    };
}