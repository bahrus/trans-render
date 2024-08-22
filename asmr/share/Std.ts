import { SetOptions, SharingObject, ValueProp } from "../../ts-refs/trans-render/asmr/types";
import { StMr } from '../StMr.js';

/**
 * Flow Content Container
 */
export class Std<TProp = any> implements SharingObject{
    constructor(targetEl: Element, public so: SetOptions){
        //this.mindRead(targetEl, so);
        StMr(targetEl, so);
    }
    // mindRead(targetEl: Element, so: SetOptions){
    //     let {valueProp, valueType, displayProp} = so;
    //     const {localName} = targetEl;
    //     if(valueProp === undefined){
    //         if(valueType === 'Boolean'){
    //             if('checked' in targetEl){
    //                 valueProp = 'checked';
    //             }else{
    //                 valueProp = 'ariaChecked';
    //             }
    //         }else{
    //             if('value' in targetEl && !'button-li'.includes(localName)){ //example 'input', 'output'
    //                 valueProp = 'value';
    //             }else if('href' in targetEl){ //example 'a', 'link'
    //                 valueProp = 'href';
    //             }else{
    //                 switch(valueType){
    //                     case 'NumericRange':
    //                         valueProp = 'ariaValueNow';
    //                         break;

    //                 }
    //             }
    //         }
    //         so.valueProp = valueProp;

    //     }
    //     if(displayProp === undefined){
    //         switch(localName){
    //             case 'input':
    //                 //no value
    //                 break;
    //             default:
    //                 switch(valueType){
    //                     case 'NumericRange':
    //                         displayProp = 'ariaValueText';
    //                         break;
    //                     default:
    //                         displayProp = 'textContent';
    //                         break;
    //                 }
    //         }

    //         so.displayProp = displayProp;
    //     }
        

    // }
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
                    throw 'NI';
            }
        }
        if(valueProp !== undefined){
            (<any>el)[valueProp!] = val;
        }
    }
}