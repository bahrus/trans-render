import { insertAdjacentTemplate } from "./insertAdjacentTemplate.js";
import { createTemplate } from './createTemplate.js';
/**
 * During pipeline processing, replace a tag with a template.
 * @param target
 * @param template
 */
export function replaceElementWithTemplate(target, ctx, template) {
    if (Array.isArray(template)) {
        template = createTemplate(template[1], ctx, template[0]);
    }
    insertAdjacentTemplate(template, target, 'afterend');
    ctx.replacedElement = target;
    target.dataset.deleteMe = 'true';
}
