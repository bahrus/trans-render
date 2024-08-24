import { SetOptions, SharingObject, ValueProp } from "../../ts-refs/trans-render/asmr/types";
import { ASMR } from "../asmr.js";

/**
 * Standard sharing
 */
export class Std<TProp = any> implements SharingObject{
    constructor(targetEl: Element, public so: SetOptions){
        //StMr(targetEl, so);
        this.readMind(targetEl, so);
    }
    readMind(el:Element, asmrOptions: SetOptions){
        let {valueProp, valueType, displayProp} = asmrOptions;
        const {localName} = el;
        if(valueProp === undefined){
            valueProp = ASMR.getValueProp(el, valueType);
            asmrOptions.valueProp = valueProp;
    
        }
        if(displayProp === undefined){
            switch(localName){
                case 'input':
                    //no value
                    break;
                default:
                    switch(valueType){
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
    pureValue: TProp | undefined;
    async setValue(el: Element, val: TProp) {
        this.pureValue = val;
        const {valueType, displayProp, valueProp} = this.so;
        const {localName} = el;
        if(displayProp !== undefined){
            switch(typeof val){
                case 'string':
                case 'boolean':
                    if(valueType === undefined){
                        (<any>el)[displayProp!] = val;
                    }else{
                        throw 'NI';
                    }
                    break;
                default:
                    throw 'NI';
            }
        }
        if(valueProp !== undefined){
            switch(valueProp!){
                case 'ariaChecked':
                    el.ariaChecked = val === true ? 'true' : val === false ? 'false' : 'mixed';
                    break;
                default:
                    (<any>el)[valueProp!] = val;
            }
            
        }
    }
}