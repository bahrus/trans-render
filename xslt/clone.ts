import {insertAdjacentTemplate} from '../lib/insertAdjacentTemplate.js';
export function clone(target: Element){
    const clone = target.cloneNode(true) as Element;
    const templates = Array.from(clone.querySelectorAll('template'));
    for(const template of templates){
        insertAdjacentTemplate(template, template, 'afterend');
        template.remove();
    }
    return clone;
}