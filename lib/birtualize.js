/**
 * "Expand" HTMLTemplateElement by replacing special tags with referenced templates
 * @param templ
 * @param templLookup
 */
export async function birtualize(templ, templRefs, templLookup) {
    if (templ.dataset.birtualized)
        return;
    const { content } = templ;
    const bis = Array.from(content.querySelectorAll('[bi]'));
    for (const bi of bis) {
        const { localName, children } = bi;
        const hasChildren = children.length > 0;
        const slotLookup = new Map();
        if (hasChildren) {
            const childrenArr = Array.from(children);
            for (const child of childrenArr) {
                const slot = child.getAttribute('slot');
                if (slot === null)
                    continue; //TODO:  slots with no names
                if (!slotLookup.has(slot)) {
                    slotLookup.set(slot, []);
                }
                const arr = slotLookup.get(slot);
                arr?.push(child);
            }
        }
        let referencedTempl = templRefs[localName];
        if (referencedTempl === undefined) {
            referencedTempl = templLookup(localName);
            if (referencedTempl === undefined)
                continue;
            templRefs[localName] = referencedTempl;
        }
        await birtualize(referencedTempl, templRefs, templLookup);
        const clone = document.importNode(referencedTempl.content, true);
        if (hasChildren) {
            const slots = slotLookup.keys();
            for (const slot of slots) {
                const slotTarget = clone.querySelector(`slot[name="${slot}"]`);
                if (slotTarget === null)
                    continue;
                slotTarget.innerHTML = ''; // fallback
                for (const matchingChild of slotLookup.get(slot)) {
                    matchingChild.removeAttribute('slot');
                    slotTarget.appendChild(matchingChild);
                }
            }
        }
        const parentElement = bi.parentElement;
        const hintTempl = document.createElement('template');
        hintTempl.dataset.ref = localName;
        hintTempl.dataset.cnt = (clone.childNodes.length + 1).toString(); // includes text nodes, to match what insertAdjacentClone does now
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
    templ.dataset.birtualized = '';
}
