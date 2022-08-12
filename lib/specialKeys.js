const picaden = new Set(['P', 'I', 'C', 'A', 'D', 'E', 'N']);
const queryLookup = new Map();
export function getQuery(key) {
    if (queryLookup.has(key))
        return queryLookup.get(key);
    let idx = 0;
    const backwardsIdx = Array.from(key).reverse().findIndex(c => picaden.has(c));
    if (backwardsIdx === -1) {
        const ret = {
            query: key,
            verb: 'querySelectorAll',
        };
        queryLookup.set(key, ret);
        return ret;
    }
    const matchIdx = key.length - 1 - backwardsIdx;
    const match = key[matchIdx];
    const attrib = key.substring(0, matchIdx);
    let query;
    let verb = 'querySelectorAll';
    const single = 'querySelector';
    let first = false;
    let lhsProp = '';
    switch (match) {
        case 'P':
            query = `[part*="${attrib}"]`;
            break;
        case 'C':
            query = `.${attrib}`;
            break;
        case 'A':
            query = `[${attrib}]`;
            break;
        case 'E':
        case 'element':
            query = attrib;
            break;
        case 'N':
            query = `[name="${attrib}"]`;
            break;
        case 'I':
            query = '#' + attrib;
            verb = single;
            first = true;
            break;
        case "D":
            query = `[-${attrib}]`;
            lhsProp = attrib;
            break;
    }
    const isPlural = key.at(-1) === 's';
    if (isPlural) {
        verb = single;
        first = true;
    }
    const q = { query, match, attrib, lhsProp, verb };
    queryLookup.set(key, q);
    return q;
}
