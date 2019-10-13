import { insertAdjacentTemplate } from "./insertAdjacentTemplate.js";
import {deleteMe} from './init.js';
import {RenderContext} from './init.d.js';
/**
 * 
 * @param target 
 * @param template 
 */
export function replaceTargetWithTag<TargetType extends HTMLElement = HTMLElement, ReplacingTagType extends HTMLElement = HTMLElement>(target: TargetType, tag: string, ctx: RenderContext, preSwapCallback?: (el: ReplacingTagType) => void){
    const tagEl = document.createElement(tag) as ReplacingTagType;
    ctx.replacedElement = target;
    (<any>target)[deleteMe] = true;
    if(preSwapCallback) preSwapCallback(tagEl);
    target.insertAdjacentElement('afterend', tagEl);
}