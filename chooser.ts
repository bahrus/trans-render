import {insertAdjacentTemplate} from './insertAdjacentTemplate.js';
export function chooser(target: Element, select: string, position: InsertPosition){
    const templ = target.querySelector(select) as HTMLTemplateElement;
    insertAdjacentTemplate(templ, target, position);
}