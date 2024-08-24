import { AbsOptions, AbsorbingObject, SetOptions, SharingObject, ValueProp, ValueType,  } from "../ts-refs/trans-render/asmr/types";
export const sym = Symbol.for('X6fTibxRk0KqM9FSHfqktA');

let sharingObjMap: WeakMap<Element, SharingObject> = (<any>globalThis)[sym] as WeakMap<Element, SharingObject>;
if(sharingObjMap === undefined){
    (<any>globalThis)[sym] = sharingObjMap = new WeakMap<Element, SharingObject>();
}

let absObjMap: WeakMap<Element, AbsorbingObject> = (<any>globalThis)[sym] as WeakMap<Element, AbsorbingObject>;
if(absObjMap === undefined){
    (<any>globalThis)[sym] = absObjMap = new WeakMap<Element, AbsorbingObject>(); 
}

export class ASMR {
    static async getSO(element: Element, options?: SetOptions){
        if(sharingObjMap.has(element)) return sharingObjMap.get(element)!;
        const {Std} = await import('./shareTo/Std.js');
        const std = new Std(element, {...(options || {})});
        sharingObjMap.set(element, std);
        return std;
    }
    static async getAO(element: Element, options?: AbsOptions){
        if(absObjMap.has(element)) return absObjMap.get(element)!;
        //const so = await ASMR.getSO(element, options);
        const {Std} = await import('./absorbFrom/Std.js');
        const std = new Std(element, {...(options || {})});
    }
    static getValueProp(el: Element, valueType?:  ValueType): ValueProp {
        const {localName} = el;
        let valueProp: ValueProp = 'value';
        if(valueType === 'Boolean'){
            if('checked' in el){
                valueProp = 'checked';
            }else{
                valueProp = 'ariaChecked';
            }
        }else{
            if('value' in el && !'button-li'.includes(localName)){ //example 'input', 'output'
                valueProp = 'value';
            }else if('href' in el){ //example 'a', 'link'
                valueProp = 'href';
            }else{
                switch(valueType){
                    case 'NumericRange':
                        valueProp = 'ariaValueNow';
                        break;

                }
            }
        }
        return valueProp;
    }
}