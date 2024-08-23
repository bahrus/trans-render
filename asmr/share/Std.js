/**
 * Standard sharing
 */
export class Std {
    so;
    constructor(targetEl, so) {
        this.so = so;
        //StMr(targetEl, so);
        this.readMind(targetEl, so);
    }
    readMind(el, asmrOptions) {
        let { valueProp, valueType, displayProp } = asmrOptions;
        const { localName } = el;
        if (valueProp === undefined) {
            if (valueType === 'Boolean') {
                if ('checked' in el) {
                    valueProp = 'checked';
                }
                else {
                    valueProp = 'ariaChecked';
                }
            }
            else {
                if ('value' in el && !'button-li'.includes(localName)) { //example 'input', 'output'
                    valueProp = 'value';
                }
                else if ('href' in el) { //example 'a', 'link'
                    valueProp = 'href';
                }
                else {
                    switch (valueType) {
                        case 'NumericRange':
                            valueProp = 'ariaValueNow';
                            break;
                    }
                }
            }
            asmrOptions.valueProp = valueProp;
        }
        if (displayProp === undefined) {
            switch (localName) {
                case 'input':
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
            asmrOptions.displayProp = displayProp;
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
