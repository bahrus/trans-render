import {TransformRules, RenderContext, TransformValueOptions} from './init.d.js';
import {countKey, idxKey, ubKey, itemsKey} from './repeatInit.js';
import {update} from './update.js';

const origStyleKey = Symbol('origStyle');
//type HTMLFn = (el: HTMLElement) => void
export function repeatethUpdateth(template: HTMLTemplateElement, ctx: RenderContext, countOrItems: number | any[], target: HTMLElement, targetTransform?: TransformValueOptions){
    const childCount = (<any>target)[countKey];
    const itemsProvided = Array.isArray(countOrItems);
    const count = itemsProvided ? (countOrItems as any[]).length : countOrItems as number;
    const ub = (<any>target)[ubKey];
    const diff = count - childCount;
    if(diff === 0) return;
    if(diff > 0){
        for(let i = 0; i < diff; i++){
            if(i + childCount < ub){
                const child = target.children[i + childCount] as HTMLElement;
                child.style.display = (<any>child)[origStyleKey];
            }else{
                const clonedTemplate = template.content.cloneNode(true) as DocumentFragment;
                //TODO:  mark children as needing initialization
                Array.from(clonedTemplate.children).forEach(c =>{
                    (<any>c)[idxKey] = childCount + i;
                    if(itemsProvided) (<any>c)[itemsKey] = (countOrItems as any[])[i];
                });
    
                target.appendChild(clonedTemplate);
            }


        }
        (<any>target)[ubKey] = childCount + diff;
    }else{
        for(let i = target.children.length - 1; i > -1; i--){
            const child = target.children[i] as HTMLElement;
            if((<any>child)[idxKey] >= count){
                //child.remove();

                (<any>child)[origStyleKey] = child.style.display;
                child.style.display = 'none';
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