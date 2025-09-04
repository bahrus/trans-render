import { splitOnce } from "../lib/splitOnce.js";
export function parse(s) {
    const [nonAsPart, asOrUndefined] = splitOnce(s, ' as ');
    const [nonEvtPart, evtName] = splitOnce(nonAsPart, '::');
    const [nonPropPath, propPath] = splitOnce(nonEvtPart, '?.');
    const [id, ext] = splitOnce(nonPropPath, '+');
    let revisedID = id;
    let constVal = undefined;
    if (id.startsWith('`') && id.endsWith('`')) {
        constVal = id.substring(1, id.length - 1);
        revisedID = undefined;
    }
    else if (id.startsWith('#')) {
        revisedID = id.substring(1);
    }
    else {
        revisedID = undefined;
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
        enhKey
    };
}
