import {TransformValueOptions, RenderContext} from './types_old.js';

export const countKey: unique symbol = Symbol.for('04efa75f-dec8-4002-a091-153683691bd1'); //what a waste of bandwidth
export const itemsKey: unique symbol = Symbol.for('bb247496-9c5d-459c-8127-fe80fee8c256');
export const idxKey: unique symbol = Symbol.for('ad7cf100-0c10-4184-b836-f560f2c15c81');
export const ubKey: unique symbol = Symbol.for('7c6fd3aa-eea3-478c-b18c-32132b1bfc7c');

export function repeatInit(template: HTMLTemplateElement, ctx: RenderContext, countOrItems: number | any[], target: Element, targetTransform?: TransformValueOptions){
    if(ctx.update) return;
    ctx.itemsKey = itemsKey;
    const itemsProvided = Array.isArray(countOrItems);
    const count = itemsProvided ? (countOrItems as any[]).length : countOrItems as number;
    (<any>target)[countKey] = count;
    (<any>target)[ubKey] = count;
    for(let i = 0; i < count; i++){
        const clonedTemplate = template.content.cloneNode(true) as DocumentFragment;
        Array.from(clonedTemplate.children).forEach(c =>{
            (<any>c)[idxKey] = i;
            if(itemsProvided) (<any>c)[itemsKey] = (countOrItems as any[])[i];
        })
        target.appendChild(clonedTemplate);
        
    }
    return targetTransform;
}