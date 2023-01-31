import {camelToLisp} from './camelToLisp.js';
export async function isResolved(host: EventTarget, tokens: string[], position?: number): Promise<void>{
    return new Promise(resolved => {
        const slicedTokens = position !== undefined ? tokens.slice(0, position) : tokens;
        const eventName = slicedTokens.map(x => camelToLisp(x)).join('.') + ".resolved";
        host.addEventListener(eventName, e => {
            resolved();
        }, {once: true});
    });
}