import { countKey, idxKey, ubKey, itemsKey } from './repeatInit2.js';
import { transform } from './transform.js';
const origStyleKey = Symbol('origStyle');
//type HTMLFn = (el: HTMLElement) => void
export function repeatethUpdateth(template, ctx, countOrItems, target, targetTransform) {
    const childCount = target[countKey];
    const itemsProvided = Array.isArray(countOrItems);
    const count = itemsProvided ? countOrItems.length : countOrItems;
    const ub = target[ubKey];
    const diff = count - childCount;
    if (diff === 0)
        return;
    if (diff > 0) {
        for (let i = 0; i < diff; i++) {
            if (i + childCount < ub) {
                const child = target.children[i + childCount];
                child.style.display = child[origStyleKey];
            }
            else {
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
        target[ubKey] = childCount + diff;
    }
    else {
        for (let i = target.children.length - 1; i > -1; i--) {
            const child = target.children[i];
            if (child[idxKey] >= count) {
                //child.remove();
                child[origStyleKey] = child.style.display;
                child.style.display = 'none';
            }
        }
    }
    target[countKey] = count;
    if (targetTransform) {
        ctx.Transform = targetTransform;
        transform(target, ctx);
    }
    return targetTransform;
}
