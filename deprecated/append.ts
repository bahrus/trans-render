export function append(target: HTMLElement | DocumentFragment, template: HTMLTemplateElement){
    target.appendChild(template.content.cloneNode(true));
}