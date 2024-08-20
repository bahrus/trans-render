export const sym = Symbol.for('X6fTibxRk0KqM9FSHfqktA');
let sharingObjMap = globalThis[sym];
if (sharingObjMap === undefined) {
    sharingObjMap = new WeakMap();
    globalThis[sym] = sharingObjMap;
}
export class ASMR {
    static async getSO(element, options) {
        if (sharingObjMap.has(element))
            return sharingObjMap.get(element);
        const { FCC } = await import('./share/FCC.js');
        const fcc = new FCC(element, { ...(options || {}) });
        sharingObjMap.set(element, fcc);
        return fcc;
    }
}
