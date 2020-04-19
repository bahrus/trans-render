import { TransRenderSymbols as TRS } from './trans-render-symbols.js';
import { setSymbol } from './manageSymbols.js';
export const countKey = setSymbol(TRS.is, 'countKey');
export const idxKey = setSymbol(TRS.is, 'idxKey');
export const itemsKey = setSymbol(TRS.is, 'itemsKey');
export const ubKey = setSymbol(TRS.is, 'ubKey');
export function repeatInit(template, ctx, countOrItems, target, targetTransform) {
    if (ctx.update)
        return;
    ctx.itemsKey = itemsKey;
    const itemsProvided = Array.isArray(countOrItems);
    const count = itemsProvided ? countOrItems.length : countOrItems;
    target[countKey] = count;
    target[ubKey] = count;
    for (let i = 0; i < countOrItems; i++) {
        const clonedTemplate = template.content.cloneNode(true);
        Array.from(clonedTemplate.children).forEach(c => {
            c[idxKey] = i;
            if (itemsProvided)
                c[itemsKey] = countOrItems[i];
        });
        target.appendChild(clonedTemplate);
    }
    return targetTransform;
}
