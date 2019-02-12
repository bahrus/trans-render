export function insertAdjacentTemplate(src, template) {
    src.style.display = 'none';
    let targetToAppend = src;
    const clonedTemplate = template.content.cloneNode(true);
    Array.from(clonedTemplate.children).forEach(child => {
        let slot = null;
        if (child.localName === 'slot') {
            slot = child;
        }
        else {
            slot = child.querySelector('slot');
        }
        if (slot !== null) {
            while (src.lastElementChild) {
                slot.insertAdjacentElement('afterend', src.lastElementChild);
            }
        }
        targetToAppend = targetToAppend.insertAdjacentElement('afterend', child);
    });
}
