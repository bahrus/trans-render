import {TransformValueOptions, RenderContext} from './types.js';
import {TransRenderSymbols as TRS} from './trans-render-symbols.js';
import {setSymbols} from './manageSymbols.js';

export const [countKey, idxKey, itemsKey, ubKey] = setSymbols(TRS.is, ['countKey', 'idxKey', 'itemsKey', 'ubKey']);

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