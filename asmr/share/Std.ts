import { SetOptions, SharingObject, ValueProp } from "../../ts-refs/trans-render/asmr/types";
import { StMr } from '../StMr.js';

/**
 * Standard sharing
 */
export class Std<TProp = any> implements SharingObject{
    constructor(targetEl: Element, public so: SetOptions){
        StMr(targetEl, so);
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