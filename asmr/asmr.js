export const sym = Symbol.for('X6fTibxRk0KqM9FSHfqktA');
let sharingObjMap = globalThis[sym];
if (sharingObjMap === undefined) {
    globalThis[sym] = sharingObjMap = new WeakMap();
}
let absObjMap = globalThis[sym];
if (absObjMap === undefined) {
    globalThis[sym] = absObjMap = new WeakMap();
}
export class ASMR {
    static async getSO(element, options) {
        if (sharingObjMap.has(element))
            return sharingObjMap.get(element);
        const { Std } = await import('./share/Std.js');
        const std = new Std(element, { ...(options || {}) });
        sharingObjMap.set(element, std);
        return std;
    }
    static async getAO(element, options) {
        if (absObjMap.has(element))
            return absObjMap.get(element);
        const { Std } = await import('./absorb/Std.js');
        const std = new Std(element, { ...(options || {}) });
    }
}
