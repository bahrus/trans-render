import {TransformValueOptions, RenderContext} from './init.d.js';
//export const countKey = '__trCount';
export const countKey = Symbol('ck');
export const idxKey = Symbol('iK');
export const ubKey = Symbol('ub');
//export const idxKey = '__trIdx';
//export const initKey = '__trInit';
export function repeatInit(template: HTMLTemplateElement, ctx: RenderContext, count: number, target: Element, targetTransform?: TransformValueOptions){
    if(ctx.update) return;
    (<any>target)[countKey] = count;
    (<any>target)[ubKey] = count;
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