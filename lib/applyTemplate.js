export function applyTemplate() {
    const target = ctx.target;
    const useShadow = te.dataset.shadowRoot !== undefined;
    let fragmentTarget = target;
    const clone = te.content.cloneNode(true);
    if (useShadow) {
        if (target.shadowRoot === null) {
            target.attachShadow({ mode: te.dataset.shadowRoot, delegatesFocus: true });
        }
        else {
            target.shadowRoot.innerHTML = '';
        }
        fragmentTarget = target.shadowRoot;
        fragmentTarget.appendChild(clone);
    }
    else {
        const slots = Array.from(clone.querySelectorAll('slot'));
        if (slots.length > 0) {
            slots.forEach(slot => {
                let slotTarget = slot;
                if (slotTarget.hasAttribute('as-template')) {
                    const templ = document.createElement('template');
                    slotTarget.insertAdjacentElement('afterend', templ);
                    slotTarget = templ;
                    slot.remove();
                }
                const name = slot.name;
                if (name) {
                    const sourceSlot = target.querySelector(`[slot="${name}"]`);
                    if (sourceSlot !== null)
                        bulkTransfer(sourceSlot, slotTarget);
                }
                else {
                    bulkTransfer(target, slotTarget);
                }
            });
            target.innerHTML = '';
            target.appendChild(clone);
        }
        else {
            const templateContents = Array.from(target.querySelectorAll('template-content'));
            const aTarget = target;
            if (aTarget[twm] === undefined) {
                aTarget[twm] = new WeakMap();
            }
            const wm = aTarget[twm];
            const existingContent = wm.get(te);
            templateContents.forEach(templateContent => {
                if (existingContent === undefined || templateContent !== existingContent) {
                    templateContent.style.display = 'none';
                    templateContent.removeAttribute('part');
                }
                else if (existingContent !== undefined && templateContent === existingContent) {
                    existingContent.style.display = 'block';
                    templateContent.setAttribute('part', 'content');
                }
            });
            if (existingContent === undefined) {
                const templateContent = document.createElement('template-content');
                templateContent.style.display = 'block';
                templateContent.setAttribute('part', 'content');
                const clone = te.content.cloneNode(true);
                templateContent.appendChild(clone);
                wm.set(te, templateContent);
                target.appendChild(templateContent);
            }
        }
        //target.innerHTML = '';
    }
}
