import { getProp } from './getProp.js';
export class SplitText {
    do(ctx) {
        const textNodes = ctx.rhs;
        const host = ctx.host;
        if (host === undefined)
            throw "No host";
        if (textNodes.length === 1) {
            const path = textNodes[0];
            ctx.target.textContent = path === '.' ? host : getVal(host, path);
        }
        else {
            ctx.target.textContent = interpolate(textNodes, host);
        }
    }
}
function getVal(host, path) {
    const qSplit = path.split('??');
    const deflt = qSplit[1];
    const dSplit = qSplit[0].split('.');
    let val = getProp(host, dSplit);
    if (val === undefined && deflt) {
        if (deflt[0] === "'") {
            return deflt.substr(1, deflt.length - 1);
        }
        else {
            return getVal(host, deflt);
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
