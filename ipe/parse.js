import { splitOnce } from "../lib/splitOnce.js";
export function parse(s) {
    const [nonAsPart, asOrUndefined] = splitOnce(s, ' as ');
    const [nonEvtPart, evtName] = splitOnce(nonAsPart, '::');
    const [id, path] = splitOnce(nonEvtPart, '.?');
    return {
        id: id === '' ? undefined : id.substring(1),
        path: path === undefined ? undefined : `.?${path}`,
        evtName,
        as: asOrUndefined
    };
}
