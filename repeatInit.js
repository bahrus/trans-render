export const countKey = '__trCount';
export const idxKey = '__trIdx';
//export const initKey = '__trInit';
export function repeatInit(ctx, count, template, target, targetTransform) {
    if (ctx.update)
        return;
    target[countKey] = count;
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
