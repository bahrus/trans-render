import { SetOptions, SharingObject, ValueProp } from "../../ts-refs/trans-render/asmr/types";
import { StMr } from '../StMr.js';

/**
 * Flow Content Container
 */
export class Std<TProp = any> implements SharingObject{
    constructor(targetEl: Element, public so: SetOptions){
        StMr(targetEl, so);
    }
    #pureValue: TProp | undefined;
    async setValue(el: Element, val: TProp) {
        this.#pureValue = val;
        const {valueType, displayProp, valueProp} = this.so;
        const {localName} = el;
        if(displayProp !== undefined){
            switch(typeof val){
                case 'string':
                case 'boolean':
                    if(valueType === undefined){
                        (<any>el)[displayProp!] = val;
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
        if(valueProp !== undefined){
            (<any>el)[valueProp!] = val;
        }
    }
}