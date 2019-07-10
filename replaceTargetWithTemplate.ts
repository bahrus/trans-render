import { insertAdjacentTemplate } from "./insertAdjacentTemplate.js";
import {deleteMe} from './init.js';
import {RenderContext} from './init.d.js';
/**
 * 
 * @param target 
 * @param template 
 */
export function replaceTargetWithTemplate(target: Element, template: HTMLTemplateElement, ctx: RenderContext){
    insertAdjacentTemplate(template, target, 'afterend');
    ctx.replacedElement = target;
    (<any>target)[deleteMe] = true;
}