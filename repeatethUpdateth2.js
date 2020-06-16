import { countKey, idxKey, ubKey } from './repeatInit2.js';
import { transform } from './transform.js';
const origStyleKey = Symbol('origStyle');
//type HTMLFn = (el: HTMLElement) => void
export function repeatethUpdateth(template, ctx, items, target, targetTransform) {
    const childCount = target[countKey];
    const count = items.length;
    const ub = target[ubKey];
    console.log(target.dataset);
    const diff = count - childCount;
    if (diff === 0)
        return;
    const ctxClone = Object.assign({}, ctx);
    ctxClone.Transform = targetTransform;
    if (diff > 0) {
        for (let i = 0; i < diff; i++) {
            ctxClone.item = items[i + childCount];
            ctxClone.idx = i + childCount;
            if (i + childCount < ub) {
                const child = target.children[i + childCount];
                child.style.display = child[origStyleKey];
            }
            else {
                transform(template, ctxClone, target);
                // const clonedTemplate = template.content.cloneNode(true) as DocumentFragment;
                // //TODO:  mark children as needing initialization
                // Array.from(clonedTemplate.children).forEach(child =>{
                //     (<any>child)[idxKey] = childCount + i;
                //     if(itemsProvided) (<any>child)[itemsKey] = (countOrItems as any[])[i];
                // });
                // target.appendChild(clonedTemplate);
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
