import { RenderContext, TransformValueOptions } from './types2.js';
import { countKey, idxKey, ubKey, itemsKey } from './repeatInit2.js';
import { transform } from './transform.js';

const origStyleKey = Symbol('origStyle');
//type HTMLFn = (el: HTMLElement) => void
export function repeatethUpdateth(template: HTMLTemplateElement, ctx: RenderContext, items: any[], target: HTMLElement, targetTransform?: TransformValueOptions){
    const childCount = (<any>target)[countKey];
    const count = items.length;
    const ub = (<any>target)[ubKey];
    console.log(target.dataset);
    const diff = count - childCount;
    if(diff === 0) return;
    const ctxClone = Object.assign({}, ctx);
    ctxClone.Transform = targetTransform!;
    if(diff > 0){
        for(let i = 0; i < diff; i++){
            ctxClone.item = items[i + childCount];
            ctxClone.idx = i + childCount;
            if(i + childCount < ub){
                const child = target.children[i + childCount] as HTMLElement;
                child.style.display = (<any>child)[origStyleKey];
            }else{

                transform(template, ctxClone, target);
                // const clonedTemplate = template.content.cloneNode(true) as DocumentFragment;
                // //TODO:  mark children as needing initialization
                // Array.from(clonedTemplate.children).forEach(child =>{
                //     (<any>child)[idxKey] = childCount + i;
                //     if(itemsProvided) (<any>child)[itemsKey] = (countOrItems as any[])[i];
                // });
    
                // target.appendChild(clonedTemplate);
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
        ctx.Transform = targetTransform as TransformValueOptions;
        transform(target, ctx);
    }
    return targetTransform;
}