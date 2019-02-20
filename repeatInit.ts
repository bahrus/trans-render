import {TransformValueOptions, RenderContext} from './init.d.js';
export const countKey = '__trCount';
export const idxKey = '__trIdx';
//export const initKey = '__trInit';
export function repeatInit(ctx: RenderContext, count: number, template: HTMLTemplateElement, target: Element, targetTransform?: TransformValueOptions){
    if(ctx.update) return;
    (<any>target)[countKey] = count;
    for(let i =0; i < count; i++){
        const clonedTemplate = template.content.cloneNode(true) as DocumentFragment;
        Array.from(clonedTemplate.children).forEach(c =>{
            //c.setAttribute(initKey, '');
            (<any>c)[idxKey] = i;
            //(c as HTMLElement).dataset.idxKey = i + '';
        })
        //TODO:  assign index to children
        target.appendChild(clonedTemplate);
        
    }
    return targetTransform;
}