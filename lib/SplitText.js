import { getProp } from './getProp.js';
import { lispToCamel } from './lispToCamel.js';
export class SplitText {
    do({ host, target, rhs, key, ctx }) {
        const toProp = this.getToProp(key) || 'textContent';
        if (rhs === '.') {
            target[toProp] = host;
            return;
        }
        if (typeof rhs === 'string') {
            target[toProp] = getVal(host, rhs);
            return;
        }
        target[toProp] = interpolate(rhs, host);
    }
    getToProp(key) {
        if (!key?.endsWith(']'))
            return;
        const iPos = key?.lastIndexOf('[');
        if (iPos === -1)
            return;
        key = key.replace('[data-data-', '[-');
        if (key[iPos + 1] !== '-')
            return;
        key = key.substring(iPos + 2, key.length - 1);
        return lispToCamel(key);
    }
}
export function interpolate(textNodes, host) {
    return textNodes.map((path, idx) => {
        if (idx % 2 === 0)
            return path;
        return getVal(host, path);
    }).join('');
}
export function getVal(host, path) {
    if (host === undefined)
        return path;
    if (path[0] !== '.')
        return host[path];
    path = path.substr(1);
    const qSplit = path.split('??');
    let deflt = qSplit[1];
    const dSplit = qSplit[0].trim().split('.');
    let val = getProp(host, dSplit);
    if (val === undefined && deflt) {
        deflt = deflt.trim();
        if (deflt[0] === ".") {
            return getVal(host, deflt);
        }
        else {
            return deflt;
        }
    }
    return val;
}
