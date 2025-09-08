import { splitOnce } from "../lib/splitOnce.js";
const host = ':host()';
const oc = '?.';
export function parse(s) {
    const [beforeEvtPart, evtNameOrUndefined] = splitOnce(s, '::');
    const [beforeAsPart, asOrUndefined] = splitOnce(beforeEvtPart, '-as-');
    let revisedID;
    let constVal;
    let prop;
    let path;
    let enhKey;
    let ish = false;
    let targetHost = false;
    let ext;
    if (beforeAsPart.startsWith('`') && beforeAsPart.endsWith('`')) {
        constVal = beforeAsPart.substring(1, beforeAsPart.length - 1);
    }
    else if (beforeAsPart.startsWith('#') || beforeAsPart.startsWith(host)) {
        const [beforePropPath, propPath] = splitOnce(beforeAsPart, oc);
        if (propPath !== undefined)
            [prop, path] = splitOnce(propPath, oc);
        if (beforeAsPart.startsWith('#')) {
            revisedID = beforePropPath.substring(1);
            [revisedID, ext] = splitOnce(revisedID, '+'); //untested
            if (ext !== undefined) {
                if (ext === 'ish') {
                    ish = true;
                }
                else {
                    enhKey = ext;
                }
            }
        }
        else {
            targetHost = true;
        }
    }
    else {
        //hostish scenario
        [prop, path] = splitOnce(beforeAsPart.substring(beforeAsPart.startsWith(oc) ? 2 : 0), '?.');
    }
    return {
        id: revisedID,
        path,
        prop,
        evtName: evtNameOrUndefined,
        as: asOrUndefined,
        constVal,
        ish,
        enhKey,
        host: targetHost
    };
}
