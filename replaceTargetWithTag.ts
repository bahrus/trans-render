import { insertAdjacentTemplate } from "./insertAdjacentTemplate.js";
import {deleteMe} from './init.js';
import {RenderContext} from './init.d.js';
/**
 * 
 * @param target 
 * @param template 
 */
export function replaceTargetWithTag(target: HTMLElement, tag: string, ctx: RenderContext, postSwapCallback?: (el: HTMLElement) => void){
    const tagEl = document.createElement(tag);
    target.insertAdjacentElement('afterend', tagEl);
    ctx.replacedElement = target;
    (<any>target)[deleteMe] = true;
    if(postSwapCallback) postSwapCallback(tagEl);
}