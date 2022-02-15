import { applyP } from './applyP.js';
//import { getProp } from './getProp.js';
export async function applyPE(host, target, pe) {
    applyP(target, pe);
    const eventSettingsMap = pe[1];
    if (eventSettingsMap !== undefined) {
        for (const key in eventSettingsMap) {
            const eventSettings = eventSettingsMap[key];
            let fn;
            switch (typeof eventSettings) {
                case 'function':
                    fn = eventSettings;
                    break;
                case 'string':
                    fn = host[eventSettings];
                    break;
                case 'object':
                    const { notifyHookUp } = await import('./notifyHookup.js');
                    await notifyHookUp(host, target, key, eventSettings);
                    break;
                default:
                    throw 'NI';
                // target.addEventListener(key, e => {
            }
            if (fn !== undefined) {
                target.addEventListener(key, fn);
            }
        }
    }
}
