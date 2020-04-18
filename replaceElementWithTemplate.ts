import { insertAdjacentTemplate } from "./insertAdjacentTemplate.js";
import {deleteMe} from './init.js';
import {createTemplate} from './createTemplate.js';
import {TransformValueOptions, RenderContext} from './init.d.js';
/**
 * During pipeline processing, replace a tag with a template.
 * @param target 
 * @param template 
 */
export function replaceElementWithTemplate(target: HTMLElement, ctx: RenderContext, template: HTMLTemplateElement | string, symbol?: symbol){
    if(typeof template === 'string'){
        template = createTemplate(template, ctx, symbol);
    }
    insertAdjacentTemplate(template as HTMLTemplateElement, target, 'afterend');
    ctx.replacedElement = target;
    (<any>target)[deleteMe] = true;
}