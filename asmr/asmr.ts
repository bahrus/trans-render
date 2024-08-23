import { AbsOptions, AbsorbingObject, SetOptions, SharingObject } from "../ts-refs/trans-render/asmr/types";
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
        const {Std} = await import('./share/Std.js');
        const std = new Std(element, {...(options || {})});
        sharingObjMap.set(element, std);
        return std;
    }
    static async getAO(element: Element, options?: AbsOptions){
        if(absObjMap.has(element)) return absObjMap.get(element)!;
        const so = await ASMR.getSO(element, options);
        const {Std} = await import('./absorb/Std.js');
        const std = new Std(element, {...(options || {})}, so);
    }
}