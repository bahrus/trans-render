import {camelToLisp} from './camelToLisp.js';
export async function isResolved(host: EventTarget, tokens: string[], position?: number): Promise<void>{
    const slicedTokens = position !== undefined ? tokens.slice(0, position) : tokens;
    const eventName = slicedTokens.map(x => camelToLisp(x)).join('.') + ".resolved";
    await waitForEvent(host, eventName);
}

export function waitForEvent(et: EventTarget, eventName: string): Promise<void>{
    return new Promise(resolved => {
        et.addEventListener(eventName, e => {
            resolved();
        }, {once: true});
    })
}