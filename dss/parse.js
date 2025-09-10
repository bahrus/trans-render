import { splitOnce } from "../lib/splitOnce.js";
const host = ':host()';
const oc = '?.';
const mySelf = '$0';
export function parse(s) {
    const [beforeEvtPart, evtNameOrUndefined] = splitOnce(s, '::');
    const [beforeAsPart, asOrUndefined] = splitOnce(beforeEvtPart, '-as-');
    let revisedID, constVal, prop, path, enhKey, ish = false, targetHost = false, ext, isSelf = false;
    const startWithHash = beforeAsPart.startsWith('#');
    const startWithSelf = beforeAsPart.startsWith(mySelf);
    if (beforeAsPart.startsWith('`') && beforeAsPart.endsWith('`')) {
        constVal = beforeAsPart.substring(1, beforeAsPart.length - 1);
    }
    else if (startWithHash || beforeAsPart.startsWith(host) || startWithSelf) {
        const [beforePropPath, propPath] = splitOnce(beforeAsPart, oc);
        if (propPath !== undefined)
            [prop, path] = splitOnce(propPath, oc);
        if (startWithHash) {
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
        else if (startWithSelf) {
            isSelf = true;
            if (beforePropPath[2] === '+') {
                ext = beforePropPath.substring(3);
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
        host: targetHost,
        self: isSelf,
    };
}
