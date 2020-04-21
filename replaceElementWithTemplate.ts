import { insertAdjacentTemplate } from "./insertAdjacentTemplate.js";
import { createTemplate } from './createTemplate.js';
import { TransformValueOptions, RenderContext } from './init.d.js';
/**
 * During pipeline processing, replace a tag with a template.
 * @param target 
 * @param template 
 */
export function replaceElementWithTemplate(target: HTMLElement, ctx: RenderContext, template: HTMLTemplateElement | string) {
    // if(Array.isArray(template)){
    //     if((<any>ctx)[template[0]] === undefined) cacheTemplate(template[1], template[0]);
    //     template = (<any>ctx)[template[0]];
    // }
    let wasString = false;
    if (typeof template === 'string') {
        template = createTemplate(template);
        wasString = true;
    }
    insertAdjacentTemplate(template as HTMLTemplateElement, target, 'afterend');
    ctx.replacedElement = target;
    target.dataset.deleteMe = 'true';
    if (wasString) {
        return function (target: HTMLElement, ctx: RenderContext) {
            replaceElementWithTemplate(target, ctx, template as HTMLTemplateElement);
        }
    }
}