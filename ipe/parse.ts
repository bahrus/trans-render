import { IPE } from "../ts-refs/trans-render/dss/types";
import { splitOnce } from "../lib/splitOnce.js";
export function parse(s: string) : IPE {
    const [nonEvtPart, evtName] = splitOnce(s, '::');
    const [id, path] = splitOnce(nonEvtPart, '.?');
    return {
        id: id === '' ? undefined : id.substring(1),
        path: path === undefined ? undefined : `.?${path}`,
        evtName
    };
}