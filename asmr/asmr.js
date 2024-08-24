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
        const { Std } = await import('./shareTo/Std.js');
        const std = new Std(element, { ...(options || {}) });
        sharingObjMap.set(element, std);
        return std;
    }
    static async getAO(element, options) {
        if (absObjMap.has(element))
            return absObjMap.get(element);
        //const so = await ASMR.getSO(element, options);
        const { Std } = await import('./absorbFrom/Std.js');
        const std = new Std(element, { ...(options || {}) });
        await std.readMind(element);
        return std;
    }
    static getValueProp(el, valueType) {
        const { localName } = el;
        let valueProp = 'value';
        if (valueType === 'Boolean') {
            if ('checked' in el) {
                valueProp = 'checked';
            }
            else {
                valueProp = 'ariaChecked';
            }
        }
        else {
            if ('value' in el && !'button-li'.includes(localName)) { //example 'input', 'output'
                valueProp = 'value';
            }
            else if ('href' in el) { //example 'a', 'link'
                valueProp = 'href';
            }
            else {
                switch (valueType) {
                    case 'NumericRange':
                        valueProp = 'ariaValueNow';
                        break;
                }
            }
        }
        return valueProp;
    }
}
