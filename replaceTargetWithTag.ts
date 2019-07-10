import { insertAdjacentTemplate } from "./insertAdjacentTemplate.js";
import {deleteMe} from './init.js';
import {RenderContext} from './init.d.js';
/**
 * 
 * @param target 
 * @param template 
 */
export function replaceTargetWithTag(target: Element, tag: string, ctx: RenderContext, postSwapCallback?: (src: Element, dest: HTMLElement) => void){
    const tagEl = document.createElement(tag);
    target.insertAdjacentElement('afterend', tagEl);
    ctx.replacedElement = target;
    (<any>target)[deleteMe] = true;
    if(postSwapCallback) postSwapCallback(target, tagEl);
}