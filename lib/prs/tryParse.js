import { arr } from '../arr.js';
export async function tryParse(s, regExpOrRegExpExt) {
    const reArr = arr(regExpOrRegExpExt);
    for (const reOrRegExt of reArr) {
        let re;
        let def;
        let dssKeys;
        if (reOrRegExt instanceof RegExp) {
            re = reOrRegExt;
        }
        else {
            re = reOrRegExt.regExp;
            def = reOrRegExt.defaultVals;
            dssKeys = reOrRegExt.dssKeys;
        }
        const test = re.exec(s);
        if (test === null)
            continue;
        const groups = test.groups;
        if (groups === undefined)
            continue;
        const parsedObj = toParsedObj(groups);
        if (def !== undefined) {
            Object.assign(parsedObj, def);
        }
        if (dssKeys !== undefined) {
            const { parse } = await import('../../dss/parse.js');
            for (const dssKey of dssKeys) {
                const propVal = parsedObj[dssKey[0]];
                if (propVal !== undefined) {
                    parsedObj[dssKey[1]] = await parse(propVal);
                }
            }
        }
        return parsedObj;
        // const returnObj =  toLcGrp(test.groups);
        // if(def !== undefined){
        //     Object.assign(returnObj, def);
        // }
        // return returnObj as TParsedObj;
    }
    return null;
}
function toParsedObj(groups) {
    const parsedObj = {};
    for (const k in groups) {
        parsedObj[k] = groups[k];
    }
    return parsedObj;
}
// function toLcGrp(groups: any){
//     const lcGroup = {} as any;
//     for(const k in groups){
//         const val = groups[k];
//         const rhs = lc(val);
//         lcGroup[k] = rhs;
//     }
//     return lcGroup;
// }
// function lc(s: string){
//     if(!s) return s;
//     return s[0].toLowerCase() + s.substring(1);
// }
