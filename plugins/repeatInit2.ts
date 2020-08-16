import {TransformValueOptions, RenderContext, ToTOrFnToTot, toTransform} from '../types.js';
import {transform, isTemplate, processEl} from '../transform.js';

export const countKey: unique symbol = Symbol.for('04efa75f-dec8-4002-a091-153683691bd1'); //what a waste of bandwidth
export const itemsKey: unique symbol = Symbol.for('bb247496-9c5d-459c-8127-fe80fee8c256');
export const idxKey: unique symbol = Symbol.for('ad7cf100-0c10-4184-b836-f560f2c15c81');
export const ubKey: unique symbol = Symbol.for('7c6fd3aa-eea3-478c-b18c-32132b1bfc7c');

export function repeatInit(template: ToTOrFnToTot, ctx: RenderContext, items: any[], target: HTMLElement, targetTransform?: TransformValueOptions | toTransform){
    const count = items.length;
    (<any>target)[countKey] = count;
    (<any>target)[ubKey] = count;
    const ctxClone = Object.assign({}, ctx);
    
    for(let i = 0; i < count; i++){
        const item = items[i];
        ctxClone.item = item;
        ctxClone.idx = i;
        ctxClone.itemTagger = (h: any) =>{
            h[idxKey] = i
            h[itemsKey] = item;
        }
        renderDynamicContent(template, ctxClone, target, targetTransform);
        // if(isTemplate(template)){
        //     ctxClone.Transform = typeof targetTransform!;
        //     transform(template as HTMLTemplateElement, ctxClone, target);
        // }else{
        //     renderDynamicContent(template, ctxClone, target);
        // }
        
        // Array.from(clonedTemplate.children).forEach(templateChild =>{
        //     (<any>templateChild)[idxKey] = i;
        //     if(itemsProvided) (<any>templateChild)[itemsKey] = (countOrItems as any[])[i];
        // });
        //keep count to last batch, then update all children from last batch
    }
}

export function renderDynamicContent(template: ToTOrFnToTot, ctx: RenderContext, target: HTMLElement, targetTransform?: TransformValueOptions | toTransform){
    if(typeof targetTransform === 'function'){
        renderDynamicContent(template, ctx, target, targetTransform(ctx));
        return;
    }

    switch(typeof template){
        case 'string':
            const el = document.createElement(template);
            target.appendChild(el);
            ctx.target = el;
            processEl(ctx);
            break;
        case 'object':
            if(isTemplate(template)){
                transform(template as HTMLTemplateElement, ctx, target);
            }
            
            break;
        case 'function':
            renderDynamicContent((<any>template)(ctx) as ToTOrFnToTot, ctx, target, targetTransform);
            break;
    }
}