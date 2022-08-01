import { camelToLisp } from "./camelToLisp.js";
export const attribs = ['parts', 'part', 'id', 'classes', 'attribs', 'elements', 'props'];
const attribsUC = attribs.map(s => s[0].toUpperCase() + s.substr(1));
const match = (e, attrib) => e.matches(attrib);
const matchClass = (e, attrib) => e.classList.contains(attrib);
const matchAtr = (e, attrib) => e.hasAttribute(attrib);
const matchEl = (e, attrib) => e.localName === attrib;
const matchId = (e, attrib) => e.id === attrib;
export function getQuery(key) {
    const lpKey = camelToLisp(key);
    let idx = 0;
    for (const type of attribs) {
        if (key.endsWith(attribsUC[idx])) {
            const attrib = lpKey.substr(0, lpKey.length - type.length - 1);
            let query;
            let verb = 'querySelectorAll';
            let matchFn;
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
                    //query = attrib;
                    //console.log(query);
                    query = `.${attrib}`;
                    //verb = 'getElementsByClassName';
                    matchFn = matchClass;
                    break;
                case 'attribs':
                case 'attrib':
                    query = `[${attrib}]`;
                    matchFn = matchAtr;
                    break;
                case 'elements':
                case 'element':
                    query = attrib;
                    verb = 'getElementsByTagName';
                    matchFn = matchEl;
                    break;
            }
            switch (type) {
                case 'part': {
                    verb = single;
                    break;
                }
                case 'id': {
                    query = attrib;
                    verb = 'getElementById';
                    matchFn = matchId;
                    break;
                }
                case 'attrib':
                case 'class':
                case 'element':
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
                return { query, type, attrib, lhsProp, verb, first, matchFn };
            }
        }
        idx++;
    }
    return {
        query: key,
        verb: 'querySelectorAll',
    };
}
