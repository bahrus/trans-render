import { DSS, Specifier, asOptions } from "../ts-refs/trans-render/dss/types";
import { splitOnce } from "../lib/splitOnce.js";
const host = ':host()';
const oc = '?.';
export function parse(s: DSS) : Specifier {
    const [beforeEvtPart, evtNameOrUndefined] = splitOnce(s, '::');
    const [beforeAsPart, asOrUndefined] = splitOnce(beforeEvtPart, '-as-');
    let revisedID: string | undefined, constVal: string | undefined, prop: string | undefined, 
        path: string | undefined, enhKey: string | undefined, ish = false, 
        targetHost = false, ext: string | undefined
    ;

    if(beforeAsPart.startsWith('`') && beforeAsPart.endsWith('`')){
        constVal = beforeAsPart.substring(1, beforeAsPart.length - 1);
    }else if(beforeAsPart.startsWith('#') || beforeAsPart.startsWith(host)){
        const [beforePropPath, propPath] = splitOnce(beforeAsPart, oc);
        if(propPath !== undefined) [prop, path] = splitOnce(propPath, oc);
        if(beforeAsPart.startsWith('#')){
            revisedID = beforePropPath.substring(1);
            [revisedID, ext] = splitOnce(revisedID, '+'); //untested
            if(ext !== undefined){
                if(ext === 'ish'){
                    ish = true;
                }else{
                    enhKey = ext;
                }
            }
        }else{
            targetHost = true;
        }
    }else{
        //hostish scenario
        [prop, path] = splitOnce(beforeAsPart.substring(beforeAsPart.startsWith(oc) ? 2: 0), '?.');
    }
    


    return {
        id: revisedID,
        path,
        prop,
        evtName: evtNameOrUndefined,
        as: asOrUndefined as asOptions,
        constVal,
        ish,
        enhKey,
        host: targetHost
    };
}