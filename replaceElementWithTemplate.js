import { insertAdjacentTemplate } from "./insertAdjacentTemplate.js";
import { deleteMe } from './init.js';
/**
 * During pipeline processing, replace a tag with a template.
 * @param target
 * @param template
 */
export function replaceElementWithTemplate(target, ctx, template) {
    insertAdjacentTemplate(template, target, 'afterend');
    ctx.replacedElement = target;
    target[deleteMe] = true;
}
