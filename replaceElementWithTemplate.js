import { insertAdjacentTemplate } from "./insertAdjacentTemplate.js";
import { deleteMe } from './init.js';
import { createTemplate } from './createTemplate.js';
/**
 * During pipeline processing, replace a tag with a template.
 * @param target
 * @param template
 */
export function replaceElementWithTemplate(target, ctx, template, symbol) {
    if (typeof template === 'string') {
        template = createTemplate(template, ctx, symbol);
    }
    insertAdjacentTemplate(template, target, 'afterend');
    ctx.replacedElement = target;
    target[deleteMe] = true;
}
