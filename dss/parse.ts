import { DSS, Specifier, asOptions } from "../ts-refs/trans-render/dss/types";
import { splitOnce } from "../lib/splitOnce.js";
const host = ':host()';
export function parse(s: DSS) : Specifier {
    const [nonAsPart, asOrUndefined] = splitOnce(s, '-as-');
    const [nonEvtPart, evtName] = splitOnce(nonAsPart, '::');
    const [nonPropPath, propPath] = splitOnce(nonEvtPart, '?.');
    //see if we 
    let [targetAndPath, ext] = splitOnce(nonPropPath, '+');
    let revisedID = targetAndPath as string | undefined;
    let constVal = undefined;
    let targetHost = false;
    if(targetAndPath.startsWith('`') && targetAndPath.endsWith('`')){
        constVal = targetAndPath.substring(1, targetAndPath.length - 1);
        revisedID = undefined;
    }else if(targetAndPath.startsWith('#')){
        revisedID = targetAndPath.substring(1);
    }else if(targetAndPath.startsWith(host)){
        revisedID = undefined;
        targetHost = true;
        targetAndPath = targetAndPath.substring(host.length);
    }else{
        //starts with path
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