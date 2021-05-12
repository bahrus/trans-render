import {getHost} from './getHost.js';
export function upShadowSearch(ref: Element, cssSel: string){
    const split = cssSel.split('/');
    const id = split[split.length - 1];
    let targetElement: Element | null;
    if (cssSel.startsWith('/')) {
        targetElement = (<any>self)[cssSel.substr(1)];
    } else{
        const len = cssSel.startsWith('./') ? 0 : split.length;
        const host = getHost(<any>ref as HTMLElement, len) as HTMLElement;
        if (host !== undefined) {
            if(len === 0){
                targetElement = (<any>host)[id];
                if(targetElement !== undefined) return targetElement;
            }
            targetElement = host.querySelector('#' + id) as HTMLElement;
        } else {
            throw 'Target Element Not found';
        }
    }
    return targetElement;
}