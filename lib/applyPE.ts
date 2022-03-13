import {PEUnionSettings, PSettings, INotify} from './types.d.js';
import {applyP} from './applyP.js';

export async function applyPE<T extends Partial<HTMLElement> = HTMLElement>(host: Element, target: Element, pe: PEUnionSettings<T>) {
    applyP(target, pe as PSettings<T>);
    const eventSettingsMap = pe[1];
    if (eventSettingsMap !== undefined) {
        for (const key in eventSettingsMap) {
            const eventSettings  = eventSettingsMap[key];
            let fn: ((e: Event) => void) | undefined;
            switch(typeof eventSettings){
                case 'function':
                    fn = eventSettings;
                    break;
                case 'string':
                    const isMethod = eventSettings[0] === '.';
                    const methodName = isMethod ? eventSettings.substring(1) : eventSettings;
                    fn = (<any>host)[methodName];
                    if(isMethod) fn = fn!.bind(host); 
                    break;
                case 'object':
                    const {notifyHookUp} = await import ('./notifyHookup.js');
                    await notifyHookUp(target, key, eventSettings);
                    break;
                default:
                    throw 'NI'; 
            }
            if(fn !== undefined){
                target.addEventListener(key, fn);
            }
        }
    }
}

