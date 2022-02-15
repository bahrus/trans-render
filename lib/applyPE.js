import { applyP } from './applyP.js';
//import { getProp } from './getProp.js';
export async function applyPE(host, target, pe) {
    applyP(target, pe);
    const eventSettings = pe[1];
    if (eventSettings !== undefined) {
        for (const key in eventSettings) {
            let eventHandler = eventSettings[key];
            target.addEventListener(key, e => {
            });
        }
    }
}
