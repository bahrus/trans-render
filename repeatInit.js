//export const countKey = '__trCount';
export const countKey = Symbol('ck');
export const idxKey = Symbol('iK');
export const ubKey = Symbol('ub');
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
