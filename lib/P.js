import { applyP } from './applyP.js';
export class P {
    async do(ctx) {
        const modifiedRHS = await modifyPRHS(ctx, 0);
        applyP(ctx.target, [modifiedRHS]);
    }
}
export async function modifyPRHS(ctx, idx) {
    const rhs = ctx.rhs[idx];
    if (rhs === undefined)
        return;
    const modifiedRHS = {};
    for (const key in rhs) {
        let val = await modifyVal(key, rhs, ctx);
        modifiedRHS[key] = val;
    }
    const newRHS = [...ctx.rhs];
    newRHS[idx] = modifiedRHS;
    ctx.rhs = newRHS;
    return modifiedRHS;
}
export async function modifyVal(key, rhs, ctx) {
    let path = rhs[key];
    const host = ctx.host;
    if (host === undefined)
        return path;
    switch (typeof path) {
        case 'string':
            const { getVal } = await import('./getVal.js');
            return getVal(host, path);
        case 'object':
            if (Array.isArray(path)) {
                const { weave } = await import('./weave.js');
                return weave(path, host);
            }
            else {
                return path; //Not implemented
            }
        default:
            return path;
    }
}
