import { RenderContext, TransformValueOptions, ToTOrFnToTot, toTransform } from '../types.js';
import { countKey, idxKey, ubKey, itemsKey, renderDynamicContent } from './repeatInit2.js';
import { transform, isTemplate } from '../transform.js';

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
                //transform(template as HTMLTemplateElement, ctxClone, target);
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
    for(let i = 0; i < items.length; i++){
        const item = items[i];
        ctxClone.item = item;
        ctxClone.idx = i;
        if(isTemplate(template)){
            transform(template as HTMLTemplateElement, ctxClone, target);
        }else{
            renderDynamicContent(template, ctxClone, target);
        }
    }
    (<any>target)[countKey] = count;

}