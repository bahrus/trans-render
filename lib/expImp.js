/**
 * "Expand" HTMLTemplateElement by replacing special tags with referenced templates
 * @param templ
 * @param templRefs
 */
export async function expImp(templ, templRefs) {
    const { content } = templ;
    const bis = Array.from(content.querySelectorAll('[bi]'));
    for (const bi of bis) {
        const localName = bi.localName;
        const templ = templRefs[localName];
        if (templ === undefined)
            continue;
        const clone = document.importNode(templ.content, true);
        const parentElement = bi.parentElement;
        const hintTempl = document.createElement('template');
        hintTempl.dataset.ref = localName;
        hintTempl.dataset.cnt = (clone.children.length + 1).toString(); // only elements, to match what insertAdjacentClone does for now
        const hasSibling = bi.nextElementSibling !== null;
        bi.insertAdjacentElement('afterend', hintTempl);
        if (parentElement !== null && !hasSibling) {
            parentElement.append(clone);
        }
        else {
            const { insertAdjacentClone } = await import('./insertAdjacentClone.js');
            insertAdjacentClone(clone, hintTempl, 'afterend');
        }
        bi.remove();
    }
    ;
}
