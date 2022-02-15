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
                    fn = (<any>host)[eventSettings];
                    break;
                case 'object':
                    const {notifyHookUp} = await import ('./notifyHookup.js');
                    await notifyHookUp(host, target, key, eventSettings);
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

