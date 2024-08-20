/**
 * Flow Content Container
 */
export class FCC {
    so;
    constructor(targetEl, so) {
        this.so = so;
        this.mindRead(targetEl, so);
    }
    mindRead(targetEl, so) {
        let { valueProp, valueType, displayProp } = so;
        const { localName } = targetEl;
        if (valueProp === undefined) {
            if (valueType === 'Boolean') {
                if ('checked' in targetEl) {
                    valueProp = 'checked';
                }
                else {
                    valueProp = 'ariaChecked';
                }
            }
            else {
                if ('value' in targetEl && !'button-li'.includes(localName)) { //example 'input', 'output'
                    valueProp = 'value';
                }
                else if ('href' in targetEl) { //example 'a', 'link'
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
            so.valueProp = valueProp;
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
            so.displayProp = displayProp;
        }
    }
    #pureValue;
    async setValue(el, val) {
        this.#pureValue = val;
        const { valueType, displayProp, valueProp } = this.so;
        const { localName } = el;
        if (displayProp !== undefined) {
            switch (typeof val) {
                case 'string':
                    if (valueType === undefined) {
                        el[displayProp] = val;
                    }
                    break;
                default:
                    throw 'NI';
            }
        }
        if (valueProp !== undefined) {
            el[valueProp] = val;
        }
    }
}
