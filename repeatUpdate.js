import { countKey, idxKey } from './repeatInit.js';
//type HTMLFn = (el: HTMLElement) => void
export function repeatUpdate(count, template, target) {
    const childCount = target[countKey];
    const diff = count - childCount;
    if (diff === 0)
        return;
    if (diff > 0) {
        for (let i = 0; i < diff; i++) {
            const clonedTemplate = template.content.cloneNode(true);
            //TODO:  mark children as needing initialization
            Array.from(clonedTemplate.children).forEach(c => {
                c[idxKey] = childCount + i;
                //(c as HTMLElement).dataset.idxKey = childCount + i + '';
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
}
//# sourceMappingURL=repeatUpdate.js.map