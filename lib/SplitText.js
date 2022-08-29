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
            target[toProp] = getVal(ctx, rhs);
            return;
        }
        //rhs is an array, with first element a string
        const { weave } = await import('./weave.js');
        target[toProp] = await weave(rhs, host);
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
