export function tryParse(s, regExpOrRegExpExt, reviver) {
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
        const returnObj = revive(test.groups, reviver);
        if (def !== undefined) {
            Object.assign(returnObj, def);
        }
        return returnObj;
    }
    return null;
}
export function arr(inp) {
    return inp === undefined ? []
        : Array.isArray(inp) ? inp : [inp];
}
export function revive(groups, reviver) {
    const lcGroup = {};
    for (const k in groups) {
        const val = groups[k];
        const rhs = reviver ? reviver(val) : val;
        lcGroup[k] = rhs;
    }
    return lcGroup;
}
