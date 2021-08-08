import { insertAdjacentTemplate } from './insertAdjacentTemplate.js';
export class TemplateMerge {
    do(ctx) {
        const template = ctx.rhs;
        let clone;
        if (template.dataset.insertPosition !== 'afterend') {
            clone = template.content.cloneNode(true);
        }
        ctx.transform(clone, ctx);
        const shadowRoot = template.getAttribute('shadowroot');
        const target = ctx.target;
        if (shadowRoot !== null) {
            if (target.shadowRoot === null || target.shadowRoot.mode === shadowRoot) {
                target.attachShadow({ mode: shadowRoot });
                target.appendChild(clone);
            }
            else {
                target.appendChild(clone);
            }
        }
        else {
            const position = (template.dataset.insertPosition || 'beforeend');
            switch (position) {
                case 'beforeend':
                    target.appendChild(clone);
                    break;
                case 'afterend':
                    insertAdjacentTemplate(template, target, position);
                    break;
                default:
                    throw "Not Implemented Yet.";
            }
        }
    }
}
