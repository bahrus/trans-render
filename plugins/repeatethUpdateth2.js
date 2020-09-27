import { countKey, idxKey, ubKey, itemsKey, renderDynamicContent } from './repeatInit2.js';
import { transform, isTemplate, processEl } from '../transform.js';
const origStyleKey = Symbol('origStyle');
//type HTMLFn = (el: HTMLElement) => void
export function repeatethUpdateth(template, ctx, items, target, targetTransform) {
    const childCount = target[countKey];
    const count = items.length;
    const ub = target[ubKey];
    console.log(target.dataset);
    const diff = count - childCount;
    const ctxClone = Object.assign({}, ctx);
    if (typeof targetTransform === 'symbol') {
        ctxClone.Transform = ctx[targetTransform];
    }
    else {
        ctxClone.Transform = targetTransform;
    }
    if (diff > 0) {
        for (let i = 0; i < childCount; i++) {
            const item = items[i];
            ctxClone.item = item;
            ctxClone.idx = i;
            const childTarget = target.children[i];
            ctxClone.target = childTarget;
            // if(isTemplate(template)){
            //     transform(template as HTMLTemplateElement, ctxClone, target);
            // }else{
            //     renderDynamicContent(template, ctxClone, target);
            // }
            processEl(ctxClone);
        }
        for (let i = 0; i < diff; i++) {
            const iOffset = i + childCount;
            const item = items[iOffset];
            ctxClone.item = item;
            ctxClone.idx = iOffset;
            if (i + childCount < ub) {
                const child = target.children[i + childCount];
                child.style.display = child[origStyleKey];
            }
            else {
                ctxClone.itemTagger = (h) => {
                    h[idxKey] = iOffset;
                    h[itemsKey] = item;
                };
                if (isTemplate(template)) {
                    transform(template, ctxClone, target);
                }
                else {
                    renderDynamicContent(template, ctxClone, target);
                }
            }
        }
        target[ubKey] = childCount + diff;
    }
    else {
        for (let i = target.children.length - 1; i > -1; i--) {
            const child = target.children[i];
            if (child[idxKey] >= count) {
                child[origStyleKey] = child.style.display;
                child.style.display = 'none';
            }
        }
    }
    target[countKey] = count;
}
