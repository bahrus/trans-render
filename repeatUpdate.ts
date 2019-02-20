import {TransformRules, RenderContext} from './init.d.js';
import {countKey, idxKey} from './repeatInit.js';
import {update} from './update.js';

//type HTMLFn = (el: HTMLElement) => void
export function repeatUpdate(template: HTMLTemplateElement, ctx: RenderContext, count: number, target: HTMLElement, targetTransform?: TransformRules){
    const childCount = (<any>target)[countKey];
    const diff = count - childCount;
    if(diff === 0) return;
    if(diff > 0){
        for(let i = 0; i < diff; i++){
            const clonedTemplate = template.content.cloneNode(true) as DocumentFragment;
            //TODO:  mark children as needing initialization
            Array.from(clonedTemplate.children).forEach(c =>{
                (<any>c)[idxKey] = childCount + i;
                //(c as HTMLElement).dataset.idxKey = childCount + i + '';
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
        ctx.Transform = targetTransform;
        update(ctx, target);
    }
    return targetTransform;
}