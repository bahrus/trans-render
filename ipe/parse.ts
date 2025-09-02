import { IPE, asOptions } from "../ts-refs/trans-render/dss/types";
import { splitOnce } from "../lib/splitOnce.js";
export function parse(s: string) : IPE {
    const [nonAsPart, asOrUndefined] = splitOnce(s, ' as ');
    const [nonEvtPart, evtName] = splitOnce(nonAsPart, '::');
    const [id, path] = splitOnce(nonEvtPart, '.?');
    let revisedID = id as string | undefined;
    let constVal = undefined;
    if(revisedID?.startsWith('`') && revisedID.endsWith('`')){
        constVal = revisedID.substring(1, revisedID.length - 1);
        revisedID = undefined;
    }else{
        revisedID =  id === '' ? undefined : id.substring(1);
    }
    
    
    return {
        id: revisedID,
        path: path === undefined ? undefined : `.?${path}`,
        evtName,
        as: asOrUndefined as asOptions,
        constVal,
    };
}