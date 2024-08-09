import {guid} from 'mount-observer/compose.js';

const ttGuid = '0j9qIjjR+UWYLrZ3FskVig'
function getCount(baseID){
    const key = Symbol.for(ttGuid + baseID);
    let returnCnt = window[key] || 0;
    const nextCnt = returnCnt + 1;
    window[key] = nextCnt;
    return returnCnt;
}

/**
 * 
 * @param templToTag @type{HTMLTemplateElement}
 * @param baseID @type{string}
 * Look at composed template from mount observer that has itemscope attribute, and tag
 * all the children that were cloned from the template with the id's and link to them via itemref
 */
export function tagTempl(templToTag: HTMLTemplateElement, baseID: string){
    //for now, assume refs already there
    const childRefs = templToTag[guid] as Array<WeakRef<Element>>;
    const keys : string[] = [];
    for(const childRef of childRefs){
        const child = childRef.deref();
        if(child === undefined) continue;
        if(!child.id){
            const cnt = getCount(baseID);
            child.id = `${baseID}_${cnt}`;
        }
        keys.push(child.id);
    }
    templToTag.setAttribute('itemref', keys.join(' '));
    if(!templToTag.hasAttribute('itemscope')) templToTag.setAttribute('itemscope', '');
}
