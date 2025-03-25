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
        let {valueProp, valueType, displayProp, path} = so;
        const {localName} = el;
        if(valueProp === undefined && path === undefined){
            valueProp = ASMR.getValueProp(el, valueType);
            so.valueProp = valueProp;
    
        }
        if(displayProp === undefined && path === undefined){
            switch(localName){
                case 'form':
                case 'input':
                case 'a':
                    //no value
                    break;
                case 'data':
                    displayProp = 'textContent';
                    break;
                default:
                    switch(valueType){
                        case 'NumericRange':
                            displayProp = 'ariaValueText';
                            break;
                        default:
                            if(valueProp === undefined){
                                displayProp = 'textContent';
                            }
                            
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
        const {valueType, displayProp, valueProp, path, allowUnsafe, action} = this.so;
        if(!allowUnsafe){
            if(displayProp?.endsWith('HTML') || valueProp?.endsWith('HTML')){
                throw 403;
            }
        }
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
                case 'object':
                    const {value, textContent} = val as {value: any, textContent: string};
                    if(valueProp !== undefined){
                        (<any>el)[valueProp] = value;
                    }
                    (<any>el)[displayProp!] = textContent;
                    return;
                    break;
                default:
                    throw 'NI';
            }
        }
        if(valueProp !== undefined){
            switch(action){
                case 'toggle':
                    (<any>el)[valueProp!] = !(<any>el)[valueProp!] || false;
                    return;
                case 'increment':
                    (<any>el)[valueProp!] = (Number((<any>el)[valueProp!]) || 0) + 1;
                    return;
                case 'decrement':
                    (<any>el)[valueProp!] = (Number((<any>el)[valueProp!]) || 0) - 1;
                    return;
                case 'set-class':
                case 'set-part':
                    const splitValueProp = valueProp.split(':');
                    const [yes, no] = splitValueProp;
                    switch(action){
                        case 'set-class':
                            if(val){
                                el.classList.add(yes);
                                if(no === undefined) return;
                                el.classList.remove(no);
                                return;
                            }else{
                                el.classList.remove(yes);
                                if(no === undefined) return;
                                el.classList.add(no);
                                return;
                            }
                        case 'set-part':
                            if(val){
                                el.part.add(yes);
                                if(no === undefined) return;
                                el.part.remove(no);
                                return;
                            }else{
                                el.part.remove(yes);
                                if(no === undefined) return;
                                el.part.add(no);
                                return;
                            }
                    }

                    return;

            }
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
            
        }else if(path !== undefined){
            const {setProp} = await import('../../lib/setProp.js');
            setProp(el, path, val);
        }
    }
}