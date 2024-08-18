import { SetOptions, SharingObject, ValueProp } from "../../ts-refs/trans-render/asmr/types";


/**
 * Flow Content Container
 */
export class FCC<TProp = any> implements SharingObject{
    constructor(targetEl: Element, public so: SetOptions){
        this.mindRead(targetEl, so);
    }
    mindRead(targetEl: Element, so: SetOptions){
        let {valueProp, valueType, displayProp} = so;
        if(valueProp === undefined){
            if(valueType === 'Boolean'){
                if('checked' in targetEl){
                    valueProp = 'checked';
                }else{
                    valueProp = 'ariaChecked';
                }
            }else{
                if('value' in targetEl){ //example 'button', 'output'
                    valueProp = 'value';
                }else if('href' in targetEl){ //example 'a', 'link'
                    valueProp = 'href';
                }else{
                    switch(valueType){
                        case 'NumericRange':
                            valueProp = 'ariaValueNow';
                            break;

                    }
                }
            }
            so.valueProp = valueProp;

        }
        if(displayProp === undefined){
            switch(valueType){
                case 'NumericRange':
                    displayProp = 'ariaValueText';
                    break;
                default:
                    displayProp = 'textContent';
                    break;
            }
            so.displayProp = 'textContent';
        }
        

    }
    #pureValue;
    setValue(el: Element, val: TProp) {
        this.#pureValue = val;
        const {valueType, displayProp} = this.so;
        switch(typeof val){
            case 'string':
                if(valueType === undefined){
                    (<any>el)[displayProp!] = val;
                }
            default:
                throw 'NI';
        }
    }
}