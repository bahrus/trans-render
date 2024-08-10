import { splitRefs } from './splitRefs.js';
export function getChildren(templ, refs) {
    const rn = templ.getRootNode();
    return splitRefs(refs)
        .map(key => rn.getElementById(key))
        .filter(x => x !== null);
}
