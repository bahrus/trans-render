export function insertAdjacentTemplate(src: HTMLElement, template: HTMLTemplateElement){
    src.style.display = 'none';
    let targetToAppend = src;
    const clonedTemplate = template.content.cloneNode(true) as DocumentFragment;
    Array.from(clonedTemplate.children).forEach(child =>{
        let slot: HTMLSlotElement | null = null;
        if(child.localName === 'slot'){
            slot = child as HTMLSlotElement;
        }else{
            slot = child.querySelector('slot');
        }
        if(slot !== null){
            while (src.lastElementChild) {
                slot.insertAdjacentElement('afterend', src.lastElementChild);
            }
        }
        targetToAppend = targetToAppend.insertAdjacentElement('afterend', child)! as HTMLElement;
    })
}