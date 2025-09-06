import { splitOnce } from "../lib/splitOnce.js";
export function parse(s) {
    const [nonAsPart, asOrUndefined] = splitOnce(s, ' as ');
    const [nonEvtPart, evtName] = splitOnce(nonAsPart, '::');
    const [nonPropPath, propPath] = splitOnce(nonEvtPart, '?.');
    let [targetAndPath, ext] = splitOnce(nonPropPath, '+');
    let revisedID = targetAndPath;
    let constVal = undefined;
    let targetHost = false;
    if (targetAndPath.startsWith('`') && targetAndPath.endsWith('`')) {
        constVal = targetAndPath.substring(1, targetAndPath.length - 1);
        revisedID = undefined;
    }
    else if (targetAndPath.startsWith('#')) {
        revisedID = targetAndPath.substring(1);
    }
    else {
        revisedID = undefined;
        const host = ':host()';
        if (targetAndPath.startsWith(host)) {
            targetHost = true;
            targetAndPath = targetAndPath.substring(host.length);
        }
    }
    let prop;
    let path;
    let enhKey;
    let ish = false;
    if (propPath !== undefined) {
        [prop, path] = splitOnce(propPath, '?.');
    }
    if (ext !== undefined) {
        if (ext === 'ish') {
            ish = true;
        }
        else {
            enhKey = ext;
        }
    }
    return {
        id: revisedID,
        path,
        prop,
        evtName,
        as: asOrUndefined,
        constVal,
        ish,
        enhKey,
        host: targetHost
    };
}
