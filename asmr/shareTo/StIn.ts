import { SetOptions, SharingObject, ValueProp } from "../../ts-refs/trans-render/asmr/types.js";
import { ASMR } from "../asmr.js";

/**
 * Standard sharing
 */
export class StdIn<TProp = any> implements SharingObject{
    #ref: WeakRef<Element>;
    isDisconnected = false;
    constructor(public so: SetOptions, el: Element){
        this.#ref = new WeakRef(el);
    }
    async readMind(){
        const el = this.#ref.deref();
        if(el === undefined) {
            this.isDisconnected = true;
            return;
        }
        const {so} = this;
        let {valueProp, valueType, displayProp} = so;
        const {localName} = el;
        if(valueProp === undefined){
            valueProp = ASMR.getValueProp(el, valueType);
            so.valueProp = valueProp;
    
        }
        if(displayProp === undefined){
            switch(localName){
                case 'input':
                    //no value
                    break;
                case 'form':
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
    
            so.displayProp = displayProp;
        }
    }
    pureValue: TProp | undefined;
    async setValue(val: TProp) {
        const el = this.#ref.deref();
        if(el === undefined){
            this.isDisconnected = true;
            return;
        }
        this.pureValue = val;
        const {valueType, displayProp, valueProp} = this.so;
        const {localName} = el;
        if(displayProp !== undefined){
            switch(typeof val){
                case 'string':
                case 'boolean':
                case 'number':
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
            const isGingerly = valueProp.startsWith('?.');
            switch(valueProp!){
                case 'ariaChecked':
                    el.ariaChecked = val === true ? 'true' : val === false ? 'false' : 'mixed';
                    break;
                default:
                    if(isGingerly){
                        const {assignGingerly} = await import('trans-render/lib/assignGingerly.js');
                        assignGingerly(el, {[valueProp!]: val});
                    }else{
                        (<any>el)[valueProp!] = val;
                    }
                    
            }
            
        }
    }
}