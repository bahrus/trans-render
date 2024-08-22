import { StMr } from '../StMr.js';
/**
 * Flow Content Container
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
                    break;
                // case 'boolean':
                //     debugger;
                //     break;
                default:
                    //remember for boolean to use "mixed" when targeting ariaChecked
                    throw 'NI';
            }
        }
        if (valueProp !== undefined) {
            el[valueProp] = val;
        }
    }
}
