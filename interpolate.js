export function interpolate(target, prop, obj, isAttr = false) {
    const privateStorageKey = '__' + prop + '__split';
    let split = target[privateStorageKey];
    if (split === undefined) {
        const txt = isAttr ? target.getAttribute(prop) : target[prop];
        split = txt.split('|');
        target[privateStorageKey] = split;
    }
    const newVal = (split.map(s => s[0] === '.' ? obj[s.substr(1)] : s)).join('');
    if (isAttr) {
        target.setAttribute(prop, newVal);
    }
    else {
        target[prop] = newVal;
    }
}
