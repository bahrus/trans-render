import {splitRefs} from './splitRefs.js';
import {CSSQuery} from '../../ts-refs/trans-render/types.js';

export function querySelector(templ: HTMLTemplateElement, refs: string, qry: CSSQuery){
    const ids = splitRefs(refs);
    const rn = templ.getRootNode() as DocumentFragment;
    for(const id of ids){
        const el = rn.getElementById(id);
        if(el?.matches(qry)) return el;
        const test = el?.querySelector(qry);
        if(test) return test;
    }
    return null;
}