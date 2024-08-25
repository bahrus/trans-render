export const sharingSym = Symbol.for('X6fTibxRk0KqM9FSHfqktA');
export const absorbingSym = Symbol.for('X6fTibxRk0KqM9FSHfqktB');
let sharingObjMap = globalThis[sharingSym];
if (sharingObjMap === undefined) {
    globalThis[sharingSym] = sharingObjMap = new WeakMap();
}
let absObjMap = globalThis[sharingSym];
if (absObjMap === undefined) {
    globalThis[absorbingSym] = absObjMap = new WeakMap();
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
