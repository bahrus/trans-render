import {getShadowRoot} from './getShadowRoot.js';
import {lispToCamel} from './lispToCamel.js';
export function upShadowSearch(ref: Element, cssSel: string){
    const split = cssSel.split('/');
    const id = split[split.length - 1];
    let targetElement: Element | null;
    if (cssSel.startsWith('/')) {
        targetElement = (<any>self)[cssSel.substr(1)];
    } else{
        const len = cssSel.startsWith('../') ? split.length : 0;
        const shadowRoot = getShadowRoot(<any>ref as HTMLElement, len) as ShadowRoot;
        if (shadowRoot !== undefined) {
            if(len === 0 && shadowRoot.host){
                targetElement = ((<any>shadowRoot).host)[lispToCamel(id)];
                if(targetElement !== undefined) return targetElement;
            }
            targetElement = shadowRoot.querySelector('#' + id) as HTMLElement;
        } else {
            throw 'Target Element Not found';
        }
    }
    return targetElement;
}