import { IPE, asOptions } from "../ts-refs/trans-render/dss/types";
import { splitOnce } from "../lib/splitOnce.js";
export function parse(s: string) : IPE {
    const [nonAsPart, asOrUndefined] = splitOnce(s, ' as ');
    const [nonEvtPart, evtName] = splitOnce(nonAsPart, '::');
    const [nonPropPath, propPath] = splitOnce(nonEvtPart, '?.');
    let [targetAndPath, ext] = splitOnce(nonPropPath, '+');
    let revisedID = targetAndPath as string | undefined;
    let constVal = undefined;
    let targetHost = false;
    if(targetAndPath.startsWith('`') && targetAndPath.endsWith('`')){
        constVal = targetAndPath.substring(1, targetAndPath.length - 1);
        revisedID = undefined;
    }else if(targetAndPath.startsWith('#')){
        revisedID = targetAndPath.substring(1);
    }else{
        revisedID = undefined;
        const host = ':host()';
        if(targetAndPath.startsWith(host)){
            targetHost = true;
            targetAndPath = targetAndPath.substring(host.length);
        }
    }
    let prop: string | undefined;
    let path: string | undefined;
    let enhKey: string | undefined;
    let ish = false;
    if(propPath !== undefined){
        [prop, path] = splitOnce(propPath, '?.');
    }
    if(ext !== undefined){
        if(ext === 'ish'){
            ish = true;
        }else{
            enhKey = ext;
        }
    }
    return {
        id: revisedID,
        path,
        prop,
        evtName,
        as: asOrUndefined as asOptions,
        constVal,
        ish,
        enhKey,
        host: targetHost
    };
}