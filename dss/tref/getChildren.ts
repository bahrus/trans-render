import {splitRefs} from 'mount-observer/refid/splitRefs.js';
export function getChildren(el: Element, refs?: string | null, baseID?: string){
    const rn = el.getRootNode() as DocumentFragment;
    if(refs === undefined || refs === null){
        refs = el.getAttribute('itemref');
        if(refs === null) return [];
    }
    let splitRef = splitRefs(refs);
    if(baseID !== undefined){
        const prefix = baseID + '-';
        splitRef = splitRef.filter(x => x.startsWith(prefix));
    }
    return splitRef
        .map(key => rn.getElementById(key))
        .filter(x => x !== null)
    ;
}