import { camelToLisp } from './camelToLisp.js';
export async function isResolved(host, tokens, position) {
    return new Promise(resolved => {
        const eventName = tokens.slice(0, position).map(x => camelToLisp(x)).join('.') + ".resolved";
        host.addEventListener(eventName, e => {
            resolved();
        }, { once: true });
    });
}
