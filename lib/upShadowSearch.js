import { getShadowRoot } from './getShadowRoot.js';
import { lispToCamel } from './lispToCamel.js';
export function upShadowSearch(ref, cssSel) {
    const split = cssSel.split('/');
    const id = split[split.length - 1];
    let targetElement;
    if (cssSel.startsWith('/')) {
        targetElement = self[cssSel.substr(1)];
    }
    else {
        const len = cssSel.startsWith('../') ? split.length : 0;
        const shadowRoot = getShadowRoot(ref, len);
        if (shadowRoot !== undefined) {
            if (len === 0 && shadowRoot.host) {
                targetElement = (shadowRoot.host)[lispToCamel(id)];
                if (targetElement !== undefined)
                    return targetElement;
            }
            targetElement = shadowRoot.querySelector('#' + id);
        }
        else {
            throw 'Target Element Not found';
        }
    }
    return targetElement;
}
