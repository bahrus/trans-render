import {splitRefs} from './splitRefs.js';
export function getChildren(templ: HTMLTemplateElement, refs: string){
    const rn = templ.getRootNode() as DocumentFragment;
    return splitRefs(refs)
        .map(key => rn.getElementById(key))
        .filter(x => x !== null)
    ;
}