import { insertAdjacentTemplate } from "./insertAdjacentTemplate.js";
import {deleteMe} from './init.js';
import {TransformValueOptions, RenderContext} from './init.d.js';
/**
 * 
 * @param target 
 * @param template 
 */
export function replaceElementWithTemplate(target: Element, template: HTMLTemplateElement, ctx: RenderContext){
    insertAdjacentTemplate(template, target, 'afterend');
    ctx.replacedElement = target;
    (<any>target)[deleteMe] = true;
}