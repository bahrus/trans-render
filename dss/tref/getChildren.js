import { splitRefs } from 'mount-observer/itemRefUtils/splitRefs.js';
export function getChildren(el, refs, baseID) {
    const rn = el.getRootNode();
    if (refs === undefined || refs === null) {
        refs = el.getAttribute('itemref');
        if (refs === null)
            return [];
    }
    let splitRef = splitRefs(refs);
    if (baseID !== undefined) {
        const prefix = baseID + '-';
        splitRef = splitRef.filter(x => x.startsWith(prefix));
    }
    return splitRef
        .map(key => rn.getElementById(key))
        .filter(x => x !== null);
}
