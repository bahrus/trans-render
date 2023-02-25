import { camelToLisp } from './camelToLisp.js';
export async function isResolved(host, tokens, position) {
    const slicedTokens = position !== undefined ? tokens.slice(0, position) : tokens;
    const eventName = slicedTokens.map(x => camelToLisp(x)).join('.') + ".resolved";
    await waitForEvent(host, eventName);
}
export function waitForEvent(et, eventName) {
    return new Promise(resolved => {
        et.addEventListener(eventName, e => {
            resolved();
        }, { once: true });
    });
}
