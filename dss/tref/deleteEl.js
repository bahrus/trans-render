import { getChildren } from './getChildren.js';
export function deleteEl(el) {
    const children = getChildren(el);
    for (const child of children) {
        deleteEl(child);
    }
    const id = el.id;
    if (id) {
        const rn = el.getRootNode();
        const scopes = rn.querySelectorAll(`[itemscope][itemref~="${id}"]`);
        for (const scope of scopes) {
            const refs = scope.getAttribute('itemref') || '';
            const newRefs = refs.split(' ').filter(x => x !== id).join(' ');
            scope.setAttribute('itemref', newRefs);
        }
    }
    el.remove();
}
