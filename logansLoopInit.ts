import {TransformValueOptions, RenderContext, ItemStatus} from './types.js';
import {TransRenderSymbols as TRS} from './trans-render-symbols.js';
import {setSymbols} from './manageSymbols.js';

//export const [countKey, idxKey, itemsKey, ubKey] = setSymbols(TRS.is, ['countKey', 'idxKey', 'itemsKey', 'ubKey']);
export const [itemLookup] = setSymbols(TRS.is, ['itemLookup'])

export interface IFragmentInfo{
    elements: Element[],
    status: ItemStatus,
}

export function logansLoopInit(
    template: HTMLTemplateElement, 
    ctx: RenderContext, 
    items: any[], 
    itemStatusFn: (a: any) => ItemStatus, 
    target: Element, 
    targetTransform?: TransformValueOptions
){
    if(ctx.update) return;
    //ctx.itemsKey = itemsKey;
    //const count = items.length;
    //(<any>target)[countKey] = count;
    //(<any>target)[ubKey] = count;
    const lookup: {[key: string] : IFragmentInfo} = {};
    (<any>target)[itemLookup] = {};
    // for(let i = 0; i < count; i++){
    //     const clonedTemplate = template.content.cloneNode(true) as DocumentFragment;
    //     Array.from(clonedTemplate.children).forEach(c =>{
    //         //(<any>c)[idxKey] = i;
    //         //if(itemsProvided) (<any>c)[itemsKey] = (countOrItems as any[])[i];
    //         const 
    //     })
    //     target.appendChild(clonedTemplate);
        
    // }
    items.forEach(item =>{
        const itemStatus = itemStatusFn(item);
        const fragmentInfo: IFragmentInfo = {
            elements: [],
            status: itemStatus,
        }
        lookup[itemStatus.identity] = fragmentInfo;
        const clonedTemplate = template.content.cloneNode(true) as DocumentFragment;
        Array.from(clonedTemplate.children).forEach(c =>{
            fragmentInfo.elements.push(c);
        })
    })
    return targetTransform;
}