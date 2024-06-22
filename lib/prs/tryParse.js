import { arr } from '../arr.js';
export async function tryParse(s, regExpOrRegExpExt) {
    const reArr = arr(regExpOrRegExpExt);
    for (const reOrRegExt of reArr) {
        let re;
        let defaultVals;
        let dssKeys;
        let partParser;
        if (reOrRegExt instanceof RegExp) {
            re = reOrRegExt;
        }
        else {
            re = reOrRegExt.regExp;
            defaultVals = reOrRegExt.defaultVals;
            dssKeys = reOrRegExt.dssKeys;
            partParser = reOrRegExt.partParser;
        }
        const test = re.exec(s);
        if (test === null)
            continue;
        const groups = test.groups;
        if (groups === undefined)
            continue;
        const parsedObj = toParsedObj(groups);
        if (partParser !== undefined) {
            for (const key in partParser) {
                const subStringToParse = parsedObj[key];
                if (subStringToParse === undefined)
                    continue;
                const subTest = await tryParse(subStringToParse, partParser[key]);
                if (subTest === null)
                    continue;
                const subObj = toParsedObj(subTest);
                parsedObj[key] = subObj;
            }
        }
        if (defaultVals !== undefined) {
            Object.assign(parsedObj, defaultVals);
        }
        if (dssKeys !== undefined) {
            const { parse } = await import('../../dss/parse.js');
            for (const dssKey of dssKeys) {
                const [partName, destProp] = dssKey;
                const propVal = parsedObj[partName];
                if (propVal === undefined)
                    continue;
                if (destProp.endsWith('[]')) {
                    const andSplit = propVal.split(' and ');
                    const newVal = [];
                    for (const token of andSplit) {
                        newVal.push(await parse(token));
                    }
                    parsedObj[destProp.substring(0, destProp.length - 2)] = newVal;
                }
                else {
                    parsedObj[destProp] = await parse(propVal);
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
