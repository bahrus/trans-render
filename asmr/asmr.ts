import { AbsOptions, AbsorbingObject, SetOptions, SharingObject, ValueProp, ValueType,  } from "../ts-refs/trans-render/asmr/types";
export const emptyOptionsSharingSym = Symbol.for('X6fTibxRk0KqM9FSHfqktA');
export const nonEmptyOptionsSharingSym = Symbol.for('X6fTibxRk0KqM9FSHfqktB');
export const emptyOptionsAbsorbingSym = Symbol.for('X6fTibxRk0KqM9FSHfqktC');
export const nonEmptyOptionsAbsorbingSym = Symbol.for('X6fTibxRk0KqM9FSHfqktD');

let emptyOptionsSharingObjMap = (<any>globalThis)[emptyOptionsSharingSym] as WeakMap<Element, SharingObject>;
if(emptyOptionsSharingObjMap === undefined){
    (<any>globalThis)[emptyOptionsSharingSym] = emptyOptionsSharingObjMap = new WeakMap<Element, SharingObject>();
}

let nonEmptyOptionsSharingObjMap = (<any>globalThis)[nonEmptyOptionsSharingSym] as  Map<SetOptions, WeakMap<Element, SharingObject>>;
if(nonEmptyOptionsSharingObjMap === undefined){
    (<any>globalThis)[nonEmptyOptionsSharingSym] = nonEmptyOptionsSharingObjMap = new Map<SetOptions, WeakMap<Element, SharingObject>>();
}

let emptyOptionsAbsObjMap = (<any>globalThis)[emptyOptionsAbsorbingSym] as WeakMap<Element, AbsorbingObject>;
if(emptyOptionsAbsObjMap === undefined){
    (<any>globalThis)[emptyOptionsAbsorbingSym] = emptyOptionsAbsObjMap = new WeakMap<Element, AbsorbingObject>(); 
}

let nonEmptyOptionsAbsObjMap = (<any>globalThis)[nonEmptyOptionsAbsorbingSym] as Map<AbsOptions, WeakMap<Element, AbsorbingObject>>;
if(nonEmptyOptionsAbsObjMap === undefined){
    (<any>globalThis)[nonEmptyOptionsAbsorbingSym] = nonEmptyOptionsAbsObjMap = new Map<AbsOptions, WeakMap<Element, AbsorbingObject>>();
}

export class ASMR {
    static async getSO(element: Element, options?: SetOptions){
        const optionsIsUndefined = options === undefined;
        if(optionsIsUndefined){
            if(emptyOptionsSharingObjMap.has(element)) return emptyOptionsSharingObjMap.get(element)!;
        }else{
            const cachedSharingObject = nonEmptyOptionsSharingObjMap.get(options)?.get(element);
            if(cachedSharingObject  !== undefined) return cachedSharingObject;
        } 
        const {StdIn} = await import('./shareTo/StIn.js');
        const sharingObj = new StdIn({...(options || {})});
        await sharingObj.readMind(element);
        if(optionsIsUndefined){
            emptyOptionsSharingObjMap.set(element, sharingObj);
        }else{
            if(!nonEmptyOptionsSharingObjMap.has(options)){
                nonEmptyOptionsSharingObjMap.set(options, new WeakMap<Element, SharingObject>());
            }
            nonEmptyOptionsSharingObjMap.get(options)!.set(element, sharingObj);
        }
        
        return sharingObj;
    }
    static async getAO(element: Element, options?: AbsOptions){
        const optionsIsUndefined = options === undefined;
        if(optionsIsUndefined){
            if(emptyOptionsAbsObjMap.has(element)) return emptyOptionsAbsObjMap.get(element)!;
        }else{
            const cachedAbsObj = nonEmptyOptionsAbsObjMap.get(options)?.get(element);
            if(cachedAbsObj !== undefined) return cachedAbsObj;
        }
        const {StOut} = await import('./absorbFrom/StOut.js');
        const absorbingObj = new StOut(element, {...(options || {})});
        await absorbingObj.readMind(element);
        await absorbingObj.hydrate(element);
        if(optionsIsUndefined){
            emptyOptionsAbsObjMap.set(element, absorbingObj);
        }else{
            if(!nonEmptyOptionsAbsObjMap.has(options)){
                nonEmptyOptionsAbsObjMap.set(options, new WeakMap<Element, AbsorbingObject>());
            }
            nonEmptyOptionsAbsObjMap.get(options)!.set(element, absorbingObj);
        }
        return absorbingObj;
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