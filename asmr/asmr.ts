import { AbsOptions, AbsorbingObject, SetOptions, SharingObject, ValueProp, ValueType,  } from "../ts-refs/trans-render/asmr/types";
export const sharingSym = Symbol.for('X6fTibxRk0KqM9FSHfqktA');
export const absorbingSym = Symbol.for('X6fTibxRk0KqM9FSHfqktB');

let sharingObjMap: WeakMap<Element, SharingObject> = (<any>globalThis)[sharingSym] as WeakMap<Element, SharingObject>;
if(sharingObjMap === undefined){
    (<any>globalThis)[sharingSym] = sharingObjMap = new WeakMap<Element, SharingObject>();
}

let absObjMap: WeakMap<Element, AbsorbingObject> = (<any>globalThis)[absorbingSym] as WeakMap<Element, AbsorbingObject>;
if(absObjMap === undefined){
    (<any>globalThis)[absorbingSym] = absObjMap = new WeakMap<Element, AbsorbingObject>(); 
}

export class ASMR {
    static async getSO(element: Element, options?: SetOptions){
        if(sharingObjMap.has(element)) return sharingObjMap.get(element)!;
        const {Std} = await import('./shareTo/StIn.js');
        const std = new Std(element, {...(options || {})});
        sharingObjMap.set(element, std);
        return std;
    }
    static async getAO(element: Element, options?: AbsOptions){
        if(absObjMap.has(element)) return absObjMap.get(element)!;
        const {StOut} = await import('./absorbFrom/StOut.js');
        const std = new StOut(element, {...(options || {})});
        await std.readMind(element);
        await std.hydrate(element);
        return std;
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