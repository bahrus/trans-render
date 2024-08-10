import { childRefsKey, cloneKey } from 'mount-observer/compose.js';
const ttGuid = '0j9qIjjR+UWYLrZ3FskVig';
function getCount(baseID) {
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
export function tagTempl(templToTag, baseID) {
    //for now, assume refs already there
    const childRefs = templToTag[childRefsKey];
    const clone = (templToTag[cloneKey] || templToTag.content.cloneNode(true));
    let children;
    if (childRefs !== undefined) {
        children = childRefs.map(ref => ref.deref()).filter(x => x !== undefined);
    }
    else {
        children = Array.from(clone.children);
        //should we add weak refs to template?
    }
    const keys = [];
    for (const child of children) {
        if (!child.id) {
            const cnt = getCount(baseID);
            child.id = `${baseID}_${cnt}`;
        }
        keys.push(child.id);
    }
    templToTag.setAttribute('itemref', keys.join(' '));
    if (!templToTag.hasAttribute('itemscope'))
        templToTag.setAttribute('itemscope', '');
}
