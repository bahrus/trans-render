import { StMr } from '../StMr.js';
/**
 * Standard sharing
 */
export class Std {
    so;
    constructor(targetEl, so) {
        this.so = so;
        StMr(targetEl, so);
    }
    #pureValue;
    async setValue(el, val) {
        this.#pureValue = val;
        const { valueType, displayProp, valueProp } = this.so;
        const { localName } = el;
        if (displayProp !== undefined) {
            switch (typeof val) {
                case 'string':
                case 'boolean':
                    if (valueType === undefined) {
                        el[displayProp] = val;
                    }
                    else {
                        throw 'NI';
                    }
                    break;
                default:
                    throw 'NI';
            }
        }
        if (valueProp !== undefined) {
            switch (valueProp) {
                case 'ariaChecked':
                    el.ariaChecked = val === true ? 'true' : val === false ? 'false' : 'mixed';
                    break;
                default:
                    el[valueProp] = val;
            }
        }
    }
}
