import { SetOptions, SharingObject } from "../ts-refs/trans-render/asmr/types";
export const sym = Symbol.for('X6fTibxRk0KqM9FSHfqktA');

let sharingObjMap: WeakMap<Element, SharingObject> = (<any>globalThis)[sym] as WeakMap<Element, SharingObject>;
if(sharingObjMap === undefined){
    sharingObjMap = new WeakMap<Element, SharingObject>();
    (<any>globalThis)[sym] = sharingObjMap;
}

export class ASMR {
    static async getSO(element: Element, options?: SetOptions){
        if(sharingObjMap.has(element)) return sharingObjMap.get(element)!;
        const {Std} = await import('./share/Std.js');
        const fcc = new Std(element, {...(options || {})});
        sharingObjMap.set(element, fcc);
        return fcc;
    }
}