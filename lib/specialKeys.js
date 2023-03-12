import { camelToLisp } from "./camelToLisp.js";
const picaden = new Set(['P', 'I', 'C', 'A', 'D', 'E', 'N']);
const queryLookup = new Map();
export function getQuery(key) {
    if (queryLookup.has(key))
        return queryLookup.get(key);
    //divide and conquer
    const idxLastHavingInner = key.lastIndexOf('HavingInner');
    if (idxLastHavingInner > -1) {
        const before = key.substring(0, idxLastHavingInner);
        const after = key.substring(idxLastHavingInner + 11);
        const left = getQuery(before);
        const right = getQuery(after);
        left.havingInner = right;
        return left;
    }
    //also
    const split = key.split('HavingAlso');
    if (split.length > 1) {
        const subs = split.map(s => getQuery(s));
        const [head, ...tail] = subs;
        const ret = head;
        ret.havingAlso = tail;
    }
    let idx = 0;
    const backwardsIdx = Array.from(key).reverse().findIndex(c => picaden.has(c));
    if (backwardsIdx === -1 || key.indexOf('-') !== -1) {
        const ret = {
            query: key,
            verb: 'querySelectorAll',
        };
        queryLookup.set(key, ret);
        return ret;
    }
    const matchIdx = key.length - 1 - backwardsIdx;
    const match = key[matchIdx];
    const attrib = camelToLisp(key.substring(0, matchIdx));
    let query;
    let verb = 'querySelectorAll';
    const single = 'querySelector';
    let first = false;
    let lhsProp = '';
    const lastLetter = key.at(-1);
    const isPlural = lastLetter === 's';
    switch (match) {
        case 'P':
            query = `[part~="${attrib}"]`;
            break;
        case 'C':
            query = `.${attrib}`;
            break;
        case 'A':
            query = `[${attrib}]`;
            break;
        case 'E':
            query = attrib;
            break;
        case 'N':
            query = `[name="${attrib}"]`;
            break;
        case 'I':
            if (isPlural || lastLetter !== 'd') {
                query = `[itemprop="${attrib}"]`;
            }
            else {
                query = '#' + attrib;
                verb = single;
                first = true;
            }
            break;
        case "D":
            query = `[-${attrib}]`;
            lhsProp = attrib;
            break;
    }
    if (!isPlural) {
        verb = single;
        first = true;
    }
    const q = { query, match, attrib, lhsProp, verb };
    queryLookup.set(key, q);
    return q;
}
export function match(el, queryInfo) {
    if (!el.matches(queryInfo.query))
        return false;
    const { havingAlso } = queryInfo;
    if (havingAlso !== undefined) {
        for (const ha of havingAlso) {
            if (!match(el, ha))
                return false;
        }
    }
    const { havingInner } = queryInfo;
    if (havingInner !== undefined) {
        const all = querySelectorAll(el, havingInner);
        return all.length > 0;
    }
    return true;
}
export function querySelectorAll(el, queryInfo) {
    const firstPass = Array.from(el.querySelectorAll(queryInfo.query));
    return firstPass.filter(x => match(x, queryInfo));
}
