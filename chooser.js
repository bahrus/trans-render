import { insertAdjacentTemplate } from './insertAdjacentTemplate.js';
export function chooser(target, select, position) {
    const templ = target.querySelector(select);
    insertAdjacentTemplate(templ, target, position);
}
