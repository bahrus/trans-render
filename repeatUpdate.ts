import {countKey} from './repeatInit.js';

//type HTMLFn = (el: HTMLElement) => void
export function repeatUpdate(count: number, template: HTMLTemplateElement, target: HTMLElement){
    const childCount = (<any>target)[countKey];
    const diff = count - childCount;
    if(diff === 0) return;
    if(diff > 0){
        for(let i = 0; i < diff; i++){
            const clonedTemplate = template.content.cloneNode(true) as DocumentFragment;
            //TODO:  mark children as needing initialization
            target.appendChild(clonedTemplate);
        }
    }else{
        
    }
    (<any>target)[countKey] = count;
}