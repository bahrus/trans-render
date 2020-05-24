import { TransRenderSymbols as TRS } from './trans-render-symbols.js';
import { setSymbols } from './manageSymbols.js';
export const [countKey, idxKey, itemsKey, ubKey] = setSymbols(TRS.is, ['countKey', 'idxKey', 'itemsKey', 'ubKey']);
export function repeatInit(template, ctx, countOrItems, target, targetTransform) {
    if (ctx.update)
        return;
    ctx.itemsKey = itemsKey;
    const itemsProvided = Array.isArray(countOrItems);
    const count = itemsProvided ? countOrItems.length : countOrItems;
    target[countKey] = count;
    target[ubKey] = count;
    for (let i = 0; i < count; i++) {
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
