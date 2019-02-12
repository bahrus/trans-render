export function insertAdjacentTemplate(src: HTMLElement, template: HTMLTemplateElement){
    const clonedTemplate = template.content.cloneNode(true) as DocumentFragment;
    Array.from(clonedTemplate.children).forEach(child =>{
        src.insertAdjacentElement('afterend', child);
    })
}