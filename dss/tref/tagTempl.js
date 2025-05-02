import { childRefsKey, cloneKey } from 'mount-observer/compose.js';
import { getCount } from './getCount.js';
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
            child.id = `${baseID}-${cnt}`;
        }
        keys.push(child.id);
    }
    if (templToTag.id && keys.length > 0) {
        const rn = templToTag.getRootNode();
        const scopes = rn.querySelectorAll(`[itemscope][itemref~="${templToTag.id}"]`);
        for (const scope of scopes) {
            const refs = scope.getAttribute('itemref') || '';
            //const newRefs = refs.split(' ').filter(x => x !== templToTag.id).concat(keys).join(' ');
            const newRefs = refs + ' ' + keys.join(' ');
            scope.setAttribute('itemref', newRefs);
        }
    }
    templToTag.setAttribute('itemref', keys.join(' '));
    if (!templToTag.hasAttribute('itemscope'))
        templToTag.setAttribute('itemscope', '');
    templToTag.after(clone);
}
