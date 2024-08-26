export const emptyOptionsSharingSym = Symbol.for('X6fTibxRk0KqM9FSHfqktA');
export const nonEmptyOptionsSharingSym = Symbol.for('X6fTibxRk0KqM9FSHfqktB');
export const absorbingSym = Symbol.for('X6fTibxRk0KqM9FSHfqktC');
let emptyOptionsSharingObjMap = globalThis[emptyOptionsSharingSym];
if (emptyOptionsSharingObjMap === undefined) {
    globalThis[emptyOptionsSharingSym] = emptyOptionsSharingObjMap = new WeakMap();
}
let nonEmptyOptionsSharingObjMap = globalThis[nonEmptyOptionsSharingSym];
if (nonEmptyOptionsSharingObjMap === undefined) {
    globalThis[nonEmptyOptionsSharingSym] = nonEmptyOptionsSharingObjMap = new Map();
}
let absObjMap = globalThis[absorbingSym];
if (absObjMap === undefined) {
    globalThis[absorbingSym] = absObjMap = new WeakMap();
}
export class ASMR {
    static async getSO(element, options) {
        const optionsIsUndefined = options === undefined;
        if (optionsIsUndefined) {
            if (emptyOptionsSharingObjMap.has(element))
                return emptyOptionsSharingObjMap.get(element);
        }
        else {
            const cachedSharingObject = nonEmptyOptionsSharingObjMap.get(options)?.get(element);
            if (cachedSharingObject !== undefined)
                return cachedSharingObject;
        }
        const { StdIn } = await import('./shareTo/StIn.js');
        const sharingObj = new StdIn({ ...(options || {}) });
        await sharingObj.readMind(element);
        if (optionsIsUndefined) {
            emptyOptionsSharingObjMap.set(element, sharingObj);
        }
        else {
            if (!nonEmptyOptionsSharingObjMap.has(options)) {
                nonEmptyOptionsSharingObjMap.set(options, new WeakMap());
            }
            nonEmptyOptionsSharingObjMap.get(options).set(element, sharingObj);
        }
        return sharingObj;
    }
    static async getAO(element, options) {
        if (absObjMap.has(element))
            return absObjMap.get(element);
        const { StOut } = await import('./absorbFrom/StOut.js');
        const std = new StOut(element, { ...(options || {}) });
        await std.readMind(element);
        await std.hydrate(element);
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
