import { insertAdjacentTemplate } from './insertAdjacentTemplate.js';
export function chooser(container, select, position, target) {
    const templ = container.querySelector(select);
    insertAdjacentTemplate(templ, target || container, position);
}
