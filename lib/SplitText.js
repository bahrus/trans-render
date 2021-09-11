import { getProp } from './getProp.js';
export class SplitText {
    do({ host, target, rhs }) {
        if (rhs === '.') {
            target.textContent = host;
        }
        const textNodes = typeof rhs === 'string' ? [rhs] : rhs;
        //const host = ctx.host as any;
        if (host === undefined) {
            target.textContent = textNodes[0];
            return;
        }
        target.textContent = interpolate(textNodes, host);
    }
}
export function getVal(host, path) {
    if (path[0] !== '.')
        return host[path];
    path = path.substr(1);
    const qSplit = path.split('??');
    const deflt = qSplit[1];
    const dSplit = qSplit[0].split('.');
    let val = getProp(host, dSplit);
    if (val === undefined && deflt) {
        if (deflt[0] === ".") {
            return getVal(host, deflt);
        }
        else {
            return deflt;
        }
    }
    return val;
}
export function interpolate(textNodes, host) {
    return textNodes.map((path, idx) => {
        if (idx % 2 === 0)
            return path;
        return getVal(host, path);
    }).join('');
}
