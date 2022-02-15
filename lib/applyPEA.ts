import { PEAUnionSettings, PSettings, PESettings } from './types.js';
import {applyP} from './applyP.js';
import {applyPE} from './applyPE.js';
import { camelToLisp } from './camelToLisp.js';

export async function applyPEA<T extends Partial<Element> = Element>(host: Element, target: Element, pea: PEAUnionSettings<T>) {
    await applyP(target, pea as PSettings<T>);
    await applyPE(host, target, pea as PESettings<T>);
    const attribSettings = pea[2];
    if (attribSettings !== undefined) {
        for (const key in attribSettings) {
            const val = attribSettings[key];
            const cKey = camelToLisp(key);
            switch (typeof val) {
                case 'boolean':
                    if(key.startsWith('.')){
                        const className = cKey.substr(1);
                        const verb = val ? 'add' : 'remove';
                        (<any>target.classList)[verb](className);
                    }else if(key.startsWith('::')){
                        const partName = cKey.substr(2);
                        const verb = val ? 'add' : 'remove';
                        (<any>target).part[verb](partName);
                    }else{
                        if (val) {
                            target.setAttribute(cKey, '');
                        } else {
                            target.removeAttribute(cKey);
                        }
                    }

                    break;
                case 'string':
                    target.setAttribute(cKey, val);
                    break;
                case 'number':
                    target.setAttribute(cKey, val.toString());
                    break;
                case 'object':
                    if (val === null) {
                        target.removeAttribute(cKey);
                    }else{
                        target.setAttribute(cKey, JSON.stringify(val));
                    }
                    break;
            }
        }
    }
}