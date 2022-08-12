import { camelToLisp } from "./camelToLisp.js";
export const attribs = ['parts', 'part', 'id', 'classes', 'class', 'attribs', 'attrib', 'elements', 'element', 'props', 'names', 'name'];
const attribsUC = attribs.map(s => s[0].toUpperCase() + s.substr(1));
const queryLookup = new Map();
export function getQuery(key) {
    if (queryLookup.has(key))
        return queryLookup.get(key);
    const lpKey = camelToLisp(key);
    let idx = 0;
    for (const type of attribs) {
        if (key.endsWith(attribsUC[idx])) {
            const attrib = lpKey.substr(0, lpKey.length - type.length - 1);
            let query;
            let verb = 'querySelectorAll';
            const single = 'querySelector';
            let first = false;
            let lhsProp = '';
            switch (type) {
                case 'parts':
                case 'part':
                    query = `[part*="${attrib}"]`;
                    break;
                case 'classes':
                case 'class':
                    query = `.${attrib}`;
                    break;
                case 'attribs':
                case 'attrib':
                    query = `[${attrib}]`;
                    break;
                case 'elements':
                case 'element':
                    query = attrib;
                    break;
                case 'names':
                case 'name':
                    query = `[name="${attrib}"]`;
                    break;
            }
            switch (type) {
                case 'id': {
                    query = '#' + attrib;
                    verb = single;
                    first = true;
                    break;
                }
                case 'part':
                case 'attrib':
                case 'class':
                case 'element':
                case 'name':
                    verb = single;
                    first = true;
                    break;
                case 'placeholders': {
                    query = attrib + '-';
                    break;
                }
                case 'props': {
                    query = `[-${attrib}]`;
                    lhsProp = key.substr(0, key.length - 5);
                    break;
                }
            }
            if (query !== undefined) {
                const q = { query, type, attrib, lhsProp, verb };
                queryLookup.set(key, q);
                return q;
            }
        }
        idx++;
    }
    const q = {
        query: key,
        verb: 'querySelectorAll',
    };
    queryLookup.set(key, q);
    return q;
}
