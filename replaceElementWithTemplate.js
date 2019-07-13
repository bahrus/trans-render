import { insertAdjacentTemplate } from "./insertAdjacentTemplate.js";
import { deleteMe } from './init.js';
/**
 *
 * @param target
 * @param template
 */
export function replaceElementWithTemplate(target, template, ctx) {
    insertAdjacentTemplate(template, target, 'afterend');
    ctx.replacedElement = target;
    target[deleteMe] = true;
}
