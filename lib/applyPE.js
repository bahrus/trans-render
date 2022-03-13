import { applyP } from './applyP.js';
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
                    const isMethod = eventSettings[0] === '.';
                    const methodName = isMethod ? eventSettings.substring(1) : eventSettings;
                    fn = host[methodName];
                    if (isMethod)
                        fn = fn.bind(host);
                    break;
                case 'object':
                    const { notifyHookUp } = await import('./notifyHookup.js');
                    await notifyHookUp(target, key, eventSettings);
                    break;
                default:
                    throw 'NI';
            }
            if (fn !== undefined) {
                target.addEventListener(key, fn);
            }
        }
    }
}
