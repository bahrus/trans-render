import { TransRenderSymbols as TRS } from './trans-render-symbols.js';
import { setSymbol } from './manageSymbols.js';
export const countKey = setSymbol(TRS.is, 'countKey');
export const idxKey = setSymbol(TRS.is, 'idxKey');
export const ubKey = setSymbol(TRS.is, 'ubKey');
//export const idxKey = '__trIdx';
//export const initKey = '__trInit';
export function repeatInit(template, ctx, count, target, targetTransform) {
    if (ctx.update)
        return;
    target[countKey] = count;
    target[ubKey] = count;
    for (let i = 0; i < count; i++) {
        const clonedTemplate = template.content.cloneNode(true);
        Array.from(clonedTemplate.children).forEach(c => {
            //c.setAttribute(initKey, '');
            c[idxKey] = i;
            //(c as HTMLElement).dataset.idxKey = i + '';
        });
        //TODO:  assign index to children
        target.appendChild(clonedTemplate);
    }
    return targetTransform;
}
