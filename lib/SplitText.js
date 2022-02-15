import { lispToCamel } from './lispToCamel.js';
export class SplitText {
    async do({ host, target, rhs, key, ctx }) {
        const toProp = this.getToProp(key) || 'textContent';
        if (rhs === '.') {
            target[toProp] = host;
            return;
        }
        if (typeof rhs === 'string') {
            const { getVal } = await import('./getVal.js');
            target[toProp] = getVal(host, rhs);
            return;
        }
        //rhs is an array, with first element a string
        target[toProp] = await interpolate(rhs, host);
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
export async function interpolate(textNodes, host) {
    return textNodes.map(async (path, idx) => {
        if (idx % 2 === 0)
            return path;
        const { getVal } = await import('./getVal.js');
        return await getVal(host, path);
    }).join('');
}
