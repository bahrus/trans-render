/**
 * Flow Content Container
 */
export class FCC {
    so;
    constructor(so, targetEl) {
        this.so = so;
        let { valueProp, valueType, displayProps } = so;
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
                if ('value' in targetEl) { //example 'button', 'output'
                    valueProp = 'value';
                }
                else if ('href' in targetEl) { //example 'a'
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
        if (displayProps === undefined) {
            switch (valueType) {
                case 'NumericRange':
                    displayProps = 'ariaValueText';
                    break;
                default:
                    displayProps = 'textContent';
            }
            so.displayProps = 'textContent';
        }
    }
}
