import { ParsedUSL, protocols, USL } from "../ts-refs/trans-render/XV/types";
import {splitOnce} from '../lib/splitOnce.js';
const cache = new Map<USL, ParsedUSL>();
export function parse(usl: USL){
    const test = cache.get(usl);
    if(test !== undefined) return test;
    const [protocol, path] = splitOnce(usl, '://') as [protocols, string];
    const [usp, accessorChain] = splitOnce(path, '?.')
    const uspParts = usp.split('/');
    const parsedUSL =  {
        protocol,
        usp,
        accessorChain,
        uspParts
    } as ParsedUSL;
    cache.set(usl, parsedUSL);
    return parsedUSL;
}