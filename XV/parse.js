import { splitOnce } from '../lib/splitOnce.js';
const cache = new Map();
export function parse(usl) {
    const test = cache.get(usl);
    if (test !== undefined)
        return test;
    const [protocol, path] = splitOnce(usl, '://');
    const [usp, accessorChain] = splitOnce(path, '.?');
    const uspParts = usp.split('/');
    const parsedUSL = {
        protocol,
        usp,
        accessorChain,
        uspParts
    };
    cache.set(usl, parsedUSL);
    return parsedUSL;
}
