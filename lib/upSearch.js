import { getHost } from './getHost.js';
export function upShadowSearch(ref, cssSel) {
    const split = cssSel.split('/');
    const id = split[split.length - 1];
    let targetElement;
    if (cssSel.startsWith('/')) {
        targetElement = self[cssSel.substr(1)];
    }
    else {
        const len = cssSel.startsWith('./') ? 0 : split.length;
        const host = getHost(ref, len);
        if (host !== undefined) {
            targetElement = host.querySelector('#' + id);
        }
        else {
            throw 'Target Element Not found';
        }
    }
}
