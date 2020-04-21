import { insertAdjacentTemplate } from "./insertAdjacentTemplate.js";
import { createTemplate } from './createTemplate.js';
/**
 * During pipeline processing, replace a tag with a template.
 * @param target
 * @param template
 */
export function replaceElementWithTemplate(target, ctx, template) {
    // if(Array.isArray(template)){
    //     if((<any>ctx)[template[0]] === undefined) cacheTemplate(template[1], template[0]);
    //     template = (<any>ctx)[template[0]];
    // }
    let wasString = false;
    if (typeof template === 'string') {
        template = createTemplate(template);
        wasString = true;
    }
    insertAdjacentTemplate(template, target, 'afterend');
    ctx.replacedElement = target;
    target.dataset.deleteMe = 'true';
    if (wasString) {
        const templateCopy = template;
        return function (target, ctx) {
            replaceElementWithTemplate(target, ctx, templateCopy);
        };
    }
}
