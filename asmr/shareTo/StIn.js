import { ASMR } from "../asmr.js";
/**
 * Standard sharing
 */
export class StdIn {
    so;
    constructor(so) {
        this.so = so;
    }
    async readMind(el) {
        const { so } = this;
        let { valueProp, valueType, displayProp } = so;
        const { localName } = el;
        if (valueProp === undefined) {
            valueProp = ASMR.getValueProp(el, valueType);
            so.valueProp = valueProp;
        }
        if (displayProp === undefined) {
            switch (localName) {
                case 'input':
                    //no value
                    break;
                case 'form':
                    //no value
                    break;
                default:
                    switch (valueType) {
                        case 'NumericRange':
                            displayProp = 'ariaValueText';
                            break;
                        default:
                            displayProp = 'textContent';
                            break;
                    }
            }
            so.displayProp = displayProp;
        }
    }
    pureValue;
    async setValue(el, val) {
        this.pureValue = val;
        const { valueType, displayProp, valueProp } = this.so;
        const { localName } = el;
        if (displayProp !== undefined) {
            switch (typeof val) {
                case 'string':
                case 'boolean':
                case 'number':
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
            const isGingerly = valueProp.startsWith('?.');
            switch (valueProp) {
                case 'ariaChecked':
                    el.ariaChecked = val === true ? 'true' : val === false ? 'false' : 'mixed';
                    break;
                default:
                    if (isGingerly) {
                        const { assignGingerly } = await import('trans-render/lib/assignGingerly.js');
                        assignGingerly(el, { [valueProp]: val });
                    }
                    else {
                        el[valueProp] = val;
                    }
            }
        }
    }
}
