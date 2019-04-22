import {insertAdjacentTemplate} from './insertAdjacentTemplate.js';
export function chooser(container: Element, select: string, position: InsertPosition, target?: HTMLElement){
    const templ = container.querySelector(select) as HTMLTemplateElement;
    insertAdjacentTemplate(templ, target || container, position);
}