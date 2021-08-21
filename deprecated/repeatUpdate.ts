import {TransformRules, RenderContext, TransformValueOptions} from './types_old.js';
import {countKey, idxKey, itemsKey} from './repeatInit.js';
import {update} from './update.js';

export function repeatUpdate(template: HTMLTemplateElement, ctx: RenderContext, countOrItems: number | any[], target: HTMLElement, targetTransform?: TransformValueOptions){
    const childCount = (<any>target)[countKey];
    const itemsProvided = Array.isArray(countOrItems);
    const count = itemsProvided ? (countOrItems as any[]).length : countOrItems as number;
    const diff = count - childCount;
    
    if(diff === 0) return;
    if(diff > 0){
        for(let i = 0; i < diff; i++){
            const clonedTemplate = template.content.cloneNode(true) as DocumentFragment;
            //TODO:  mark children as needing initialization
            Array.from(clonedTemplate.children).forEach(c =>{
                (<any>c)[idxKey] = childCount + i;
                if(itemsProvided) (<any>c)[itemsKey] = (countOrItems as any[])[i];
            });

            target.appendChild(clonedTemplate);

        }
    }else{
        for(let i = target.children.length - 1; i > -1; i--){
            const child = target.children[i];
            if((<any>child)[idxKey] >= count){
                child.remove();
            }
        }
    }
    (<any>target)[countKey] = count;
    if(targetTransform){
        ctx.Transform = targetTransform as TransformRules;
        update(ctx, target);
    }
    return targetTransform;
}