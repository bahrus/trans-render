import { insertAdjacentTemplate } from "./insertAdjacentTemplate";
import {deleteMe} from './init.js';
/**
 * 
 * @param target 
 * @param template 
 */
export function replaceTargetWithTemplate(target: Element, template: HTMLTemplateElement){
    insertAdjacentTemplate(template, target, 'afterend');
    (<any>target)[deleteMe] = true;
}