import { insertAdjacentTemplate } from '../lib/insertAdjacentTemplate.js';
export function clone(target) {
    const clone = target.cloneNode(true);
    const templates = Array.from(clone.querySelectorAll('template'));
    for (const template of templates) {
        insertAdjacentTemplate(template, template, 'afterend');
        template.remove();
    }
    return clone;
}
