import { RenderContext, TransformValueOptions, ToTOrFnToTot, toTransform } from '../types.js';
import { countKey, idxKey, ubKey, itemsKey, renderDynamicContent } from './repeatInit2.js';
import { transform, isTemplate, processEl } from '../transform.js';

const origStyleKey = Symbol('origStyle');
//type HTMLFn = (el: HTMLElement) => void
export function repeatethUpdateth(template: ToTOrFnToTot, ctx: RenderContext, items: any[], target: HTMLElement, targetTransform?: TransformValueOptions | symbol){
    const childCount = (<any>target)[countKey];
    const count = items.length;
    const ub = (<any>target)[ubKey];
    console.log(target.dataset);
    const diff = count - childCount;
    const ctxClone = Object.assign({}, ctx);
    if(typeof targetTransform === 'symbol'){
        ctxClone.Transform = (<any>ctx)[targetTransform];
    }else{
        ctxClone.Transform = targetTransform!;
    }
    for(let i = 0; i < Math.max(childCount, count); i++){
        //TODO:  this is assuming each item maps to one element.
        //Need to use (<any>child)[idxKey]
        const item = items[i];
        ctxClone.item = item;
        ctxClone.idx = i;
        const childTarget = target.children[i];
        ctxClone.target = childTarget as HTMLElement;
        // if(isTemplate(template)){
        //     transform(template as HTMLTemplateElement, ctxClone, target);
        // }else{
        //     renderDynamicContent(template, ctxClone, target);
        // }
        if(typeof(ctxClone.Transform) === 'function'){
            (<any>ctx).Transform(ctxClone);
        }
        processEl(ctxClone);
    }
    if(diff > 0){

        for(let i = 0; i < diff; i++){
            const iOffset = i + childCount;
            const item = items[iOffset];
            ctxClone.item = item;
            ctxClone.idx = iOffset;
            if(i + childCount < ub){
                const child = target.children[i + childCount] as HTMLElement;
                child.style.display = (<any>child)[origStyleKey];
            }else{
                ctxClone.itemTagger = (h: any) =>{
                    h[idxKey] = iOffset;
                    h[itemsKey] = item;
                }
                if(isTemplate(template)){
                    transform(template as HTMLTemplateElement, ctxClone, target);
                }else{
                    renderDynamicContent(template, ctxClone, target);
                }
            }
        }
        (<any>target)[ubKey] = childCount + diff;
    }else{
        for(let i = target.children.length - 1; i > -1; i--){
            const child = target.children[i] as HTMLElement;
            if((<any>child)[idxKey] >= count){
                (<any>child)[origStyleKey] = child.style.display;
                child.style.display = 'none';
            }
        }
    }

    (<any>target)[countKey] = count;

}