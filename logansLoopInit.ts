// import {TransformValueOptions, RenderContext, ItemStatus} from './types.js';
// import {TransRenderSymbols as TRS} from './trans-render-symbols.js';
// import {setSymbols} from './manageSymbols.js';

// //export const [countKey, idxKey, itemsKey, ubKey] = setSymbols(TRS.is, ['countKey', 'idxKey', 'itemsKey', 'ubKey']);
// export const [itemLookup] = setSymbols(TRS.is, ['itemLookup'])

// export function logansLoopInit(
//     template: HTMLTemplateElement, 
//     ctx: RenderContext, 
//     items: any[], 
//     itemStatus: (a: any) => ItemStatus, 
//     target: Element, 
//     targetTransform?: TransformValueOptions
// ){
//     if(ctx.update) return;
//     //ctx.itemsKey = itemsKey;
//     const count = items.length;
//     //(<any>target)[countKey] = count;
//     //(<any>target)[ubKey] = count;
//     (<any>target)[itemLookup] = {};
//     for(let i = 0; i < count; i++){
//         const clonedTemplate = template.content.cloneNode(true) as DocumentFragment;
//         Array.from(clonedTemplate.children).forEach(c =>{
//             (<any>c)[idxKey] = i;
//             if(itemsProvided) (<any>c)[itemsKey] = (countOrItems as any[])[i];
//         })
//         target.appendChild(clonedTemplate);
        
//     }
//     return targetTransform;
// }