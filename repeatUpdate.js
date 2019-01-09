import { countKey } from './repeatInit.js';
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
            target.appendChild(clonedTemplate);
        }
    }
    else {
    }
    target[countKey] = count;
}
//# sourceMappingURL=repeatUpdate.js.map