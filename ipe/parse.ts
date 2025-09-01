import { IPE, asOptions } from "../ts-refs/trans-render/dss/types";
import { splitOnce } from "../lib/splitOnce.js";
export function parse(s: string) : IPE {
    const [nonAsPart, asOrUndefined] = splitOnce(s, ' as ');
    const [nonEvtPart, evtName] = splitOnce(nonAsPart, '::');
    const [id, path] = splitOnce(nonEvtPart, '.?');
    return {
        id: id === '' ? undefined : id.substring(1),
        path: path === undefined ? undefined : `.?${path}`,
        evtName,
        as: asOrUndefined as asOptions
    };
}