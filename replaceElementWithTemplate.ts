import { insertAdjacentTemplate } from "./insertAdjacentTemplate.js";
import {deleteMe} from './init.js';
import {TransformValueOptions, RenderContext} from './init.d.js';
/**
 * During pipeline processing, replace a tag with a template.
 * @param target 
 * @param template 
 */
export function replaceElementWithTemplate(target: HTMLElement, ctx: RenderContext, template: HTMLTemplateElement){
    insertAdjacentTemplate(template, target, 'afterend');
    ctx.replacedElement = target;
    (<any>target)[deleteMe] = true;
}