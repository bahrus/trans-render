import { applyP } from './applyP.js';
import { applyPE } from './applyPE.js';
export function applyPEA(host, target, pea) {
    applyP(target, pea);
    applyPE(host, target, pea);
    const attribSettings = pea[2];
    if (attribSettings !== undefined) {
        for (const key in attribSettings) {
            const val = attribSettings[key];
            switch (typeof val) {
                case 'boolean':
                    if (val) {
                        target.setAttribute(key, '');
                    }
                    else {
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
                    if (val === null)
                        target.removeAttribute(key);
                    break;
            }
        }
    }
}
