import { insertAdjacentTemplate } from "./insertAdjacentTemplate.js";
import {createTemplate} from './createTemplate.js';
import {TransformValueOptions, RenderContext} from './types_old.js';
/**
 * During pipeline processing, replace a tag with a template.
 * @param target 
 * @param template 
 */
export function replaceElementWithTemplate(target: HTMLElement, ctx: RenderContext, template: HTMLTemplateElement | [symbol, string]){
    if(Array.isArray(template)){
        template = createTemplate(template[1], ctx, template[0]);
    }
    insertAdjacentTemplate(template as HTMLTemplateElement, target, 'afterend');
    ctx.replacedElement = target;
    target.dataset.deleteMe = 'true';
}