import { splitRefs } from './splitRefs.js';
export function querySelector(templ, refs, qry) {
    const ids = splitRefs(refs);
    const rn = templ.getRootNode();
    for (const id of ids) {
        const el = rn.getElementById(id);
        if (el?.matches(qry))
            return el;
        const test = el?.querySelector(qry);
        if (test)
            return test;
    }
    return null;
}
