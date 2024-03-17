import { arr } from '../arr.js';
export function tryParse(s, regExpOrRegExpExt) {
    const reArr = arr(regExpOrRegExpExt);
    for (const reOrRegExt of reArr) {
        let re;
        let def;
        if (reOrRegExt instanceof RegExp) {
            re = reOrRegExt;
        }
        else {
            re = reOrRegExt.regExp;
            def = reOrRegExt.defaultVals;
        }
        const test = re.exec(s);
        if (test === null)
            continue;
        const returnObj = toLcGrp(test.groups);
        if (def !== undefined) {
            Object.assign(returnObj, def);
        }
        return returnObj;
    }
    return null;
}
function toLcGrp(groups) {
    const lcGroup = {};
    for (const k in groups) {
        const val = groups[k];
        const rhs = lc(val);
        lcGroup[k] = rhs;
    }
    return lcGroup;
}
function lc(s) {
    if (!s)
        return s;
    return s[0].toLowerCase() + s.substring(1);
}
