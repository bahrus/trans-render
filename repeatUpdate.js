import { countKey, idxKey, itemsKey } from './repeatInit.js';
import { update } from './update.js';
//type HTMLFn = (el: HTMLElement) => void
export function repeatUpdate(template, ctx, countOrItems, target, targetTransform) {
    const childCount = target[countKey];
    const itemsProvided = Array.isArray(countOrItems);
    const count = itemsProvided ? countOrItems.length : countOrItems;
    const diff = count - childCount;
    if (diff === 0)
        return;
    if (diff > 0) {
        for (let i = 0; i < diff; i++) {
            const clonedTemplate = template.content.cloneNode(true);
            //TODO:  mark children as needing initialization
            Array.from(clonedTemplate.children).forEach(c => {
                c[idxKey] = childCount + i;
                if (itemsProvided)
                    c[itemsKey] = countOrItems[i];
            });
            target.appendChild(clonedTemplate);
        }
    }
    else {
        for (let i = target.children.length - 1; i > -1; i--) {
            const child = target.children[i];
            if (child[idxKey] >= count) {
                child.remove();
            }
        }
    }
    target[countKey] = count;
    if (targetTransform) {
        ctx.Transform = targetTransform;
        update(ctx, target);
    }
    return targetTransform;
}
