export const emptyOptionsSharingSym = Symbol.for('X6fTibxRk0KqM9FSHfqktA');
export const nonEmptyOptionsSharingSym = Symbol.for('X6fTibxRk0KqM9FSHfqktB');
export const emptyOptionsAbsorbingSym = Symbol.for('X6fTibxRk0KqM9FSHfqktC');
export const nonEmptyOptionsAbsorbingSym = Symbol.for('X6fTibxRk0KqM9FSHfqktD');
let emptyOptionsSharingObjMap = globalThis[emptyOptionsSharingSym];
if (emptyOptionsSharingObjMap === undefined) {
    globalThis[emptyOptionsSharingSym] = emptyOptionsSharingObjMap = new WeakMap();
}
let nonEmptyOptionsSharingObjMap = globalThis[nonEmptyOptionsSharingSym];
if (nonEmptyOptionsSharingObjMap === undefined) {
    globalThis[nonEmptyOptionsSharingSym] = nonEmptyOptionsSharingObjMap = new Map();
}
let emptyOptionsAbsObjMap = globalThis[emptyOptionsAbsorbingSym];
if (emptyOptionsAbsObjMap === undefined) {
    globalThis[emptyOptionsAbsorbingSym] = emptyOptionsAbsObjMap = new WeakMap();
}
let nonEmptyOptionsAbsObjMap = globalThis[nonEmptyOptionsAbsorbingSym];
if (nonEmptyOptionsAbsObjMap === undefined) {
    globalThis[nonEmptyOptionsAbsorbingSym] = nonEmptyOptionsAbsObjMap = new Map();
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
        const optionsIsUndefined = options === undefined;
        if (optionsIsUndefined) {
            if (emptyOptionsAbsObjMap.has(element))
                return emptyOptionsAbsObjMap.get(element);
        }
        else {
            const cachedAbsObj = nonEmptyOptionsAbsObjMap.get(options)?.get(element);
            if (cachedAbsObj !== undefined)
                return cachedAbsObj;
        }
        const { StOut } = await import('./absorbFrom/StOut.js');
        const absorbingObj = new StOut(element, { ...(options || {}) });
        await absorbingObj.readMind(element);
        await absorbingObj.hydrate(element);
        if (optionsIsUndefined) {
            emptyOptionsAbsObjMap.set(element, absorbingObj);
        }
        else {
            if (!nonEmptyOptionsAbsObjMap.has(options)) {
                nonEmptyOptionsAbsObjMap.set(options, new WeakMap());
            }
            nonEmptyOptionsAbsObjMap.get(options).set(element, absorbingObj);
        }
        return absorbingObj;
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
            switch (localName) {
                case 'input':
                    const { type } = el;
                    switch (type) {
                        case 'checkbox':
                            valueProp = 'checked';
                            break;
                        case 'text':
                        case 'password':
                        case 'email':
                        case 'tel':
                        case 'url':
                            valueProp = 'value';
                            break;
                        case 'number':
                        case 'range':
                            valueProp = 'valueAsNumber';
                            break;
                        default:
                            throw 'NI';
                    }
                    break;
                case 'meta':
                    valueProp = 'content';
                    break;
                default:
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
        }
        return valueProp;
    }
}
