import { splitOnce } from "../lib/splitOnce.js";
export function parse(s) {
    const [nonEvtPart, evtName] = splitOnce(s, '::');
    const [id, path] = splitOnce(nonEvtPart, '.?');
    return {
        id,
        path: path === undefined ? undefined : `.?${path}`,
        evtName
    };
}
