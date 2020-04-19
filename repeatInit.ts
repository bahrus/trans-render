import {TransformValueOptions, RenderContext} from './init.d.js';
import {TransRenderSymbols as TRS} from './trans-render-symbols.js';
import {setSymbol} from './manageSymbols.js';

export const countKey = setSymbol(TRS.is, 'countKey');
export const idxKey = setSymbol(TRS.is, 'idxKey');
export const ubKey = setSymbol(TRS.is, 'ubKey');
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