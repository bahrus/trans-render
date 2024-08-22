const id = 'trans-render.StMr';
/**
 * Standard MindRead
 * @param el
 * @param asmrOptions
 */
export function StMr(el, asmrOptions) {
    let { valueProp, valueType, displayProp, mrID } = asmrOptions;
    if (mrID === id)
        return;
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
        asmrOptions.mrID = id;
    }
}
