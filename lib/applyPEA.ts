import { PEAUnionSettings, PSettings, PESettings } from './types.js';
import {applyP} from './applyP.js';
import {applyPE} from './applyPE.js';

export function applyPEA<T extends Partial<Element> = Element>(host: Element, target: Element, pea: PEAUnionSettings<T>) {
    applyP(target, pea as PSettings<T>);
    applyPE(host, target, pea as PESettings<T>);
    const attribSettings = pea[2];
    if (attribSettings !== undefined) {
        for (const key in attribSettings) {
            const val = attribSettings[key];
            switch (typeof val) {
                case 'boolean':
                    if (val) {
                        target.setAttribute(key, '');
                    } else {
                        target.removeAttribute(key);
                    }
                    break;
                case 'string':
                    target.setAttribute(key, val);
                    break;
                case 'number':
                    target.setAttribute(key, val.toString());
                    break;
                case 'object':
                    if (val === null) target.removeAttribute(key);
                    break;
            }
        }
    }
}