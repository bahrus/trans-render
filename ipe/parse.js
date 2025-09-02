import { splitOnce } from "../lib/splitOnce.js";
export function parse(s) {
    const [nonAsPart, asOrUndefined] = splitOnce(s, ' as ');
    const [nonEvtPart, evtName] = splitOnce(nonAsPart, '::');
    const [id, path] = splitOnce(nonEvtPart, '.?');
    let revisedID = id;
    let constVal = undefined;
    if (revisedID?.startsWith('`') && revisedID.endsWith('`')) {
        constVal = revisedID.substring(1, revisedID.length - 1);
        revisedID = undefined;
    }
    else {
        revisedID = id === '' ? undefined : id.substring(1);
    }
    return {
        id: revisedID,
        path: path === undefined ? undefined : `.?${path}`,
        evtName,
        as: asOrUndefined,
        constVal,
    };
}
