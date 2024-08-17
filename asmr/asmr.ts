import { SetOptions } from "../ts-refs/trans-render/asmr/types";
export const sym = Symbol.for('X6fTibxRk0KqM9FSHfqktA');

let map: WeakMap<Element, PIP> = (<any>globalThis)[sym] as WeakMap<Element, PIP>;
if(map === undefined){
    map = new WeakMap<Element, PIP>();
    (<any>globalThis)[sym] = map;
}

export class ASMR {
    static async getSO(element: Element, options?: SetOptions){
        const {FCC} = await import('./share/FCC.js');
    }
}