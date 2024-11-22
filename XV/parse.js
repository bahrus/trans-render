import { splitOnce } from '../lib/splitOnce.js';
const cache = new Map();
export function parse(usl) {
    const test = cache.get(usl);
    if (test !== undefined)
        return test;
    const [protocol, path] = splitOnce(usl, '://');
    const [usd, accessorChain] = splitOnce(path, '?.');
    const uspParts = usd.split('/');
    const usp = `${protocol}://${usd}`;
    const parsedUSL = {
        protocol,
        usp,
        accessorChain,
        uspParts
    };
    cache.set(usl, parsedUSL);
    return parsedUSL;
}
