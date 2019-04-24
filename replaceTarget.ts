import { insertAdjacentTemplate } from "./insertAdjacentTemplate";

export function replaceTargetWithTemplate(target: Element, template: HTMLTemplateElement){
    insertAdjacentTemplate(template, target, 'afterend');
    target.remove();
}