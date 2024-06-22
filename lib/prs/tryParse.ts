import { arr } from '../arr.js';
import { RegExpExt, RegExpOrRegExpExt, StatementPartParser } from './types';
export { RegExpOrRegExpExt } from './types';

export async function tryParse<TParsedObj = any>(s: string, regExpOrRegExpExt: RegExpOrRegExpExt<TParsedObj> | RegExpOrRegExpExt<TParsedObj>[]){
    const reArr = arr(regExpOrRegExpExt);
    for(const reOrRegExt of reArr){
        let re: RegExp | undefined;
        let defaultVals: Partial<TParsedObj> | undefined;
        let dssKeys: [string, string][] | undefined;
        let statementPartParser: StatementPartParser | undefined
        if(reOrRegExt instanceof RegExp){
            re = reOrRegExt;
        }else{
            re = reOrRegExt.regExp as RegExp;
            defaultVals = reOrRegExt.defaultVals;
            dssKeys = reOrRegExt.dssKeys;
            statementPartParser = reOrRegExt.statementPartParser;
        }
        const test = re.exec(s);
        if(test === null) continue;
        const groups = test.groups;
        if(groups === undefined) continue;
        const parsedObj = toParsedObj(groups);
        if(statementPartParser !== undefined){
            const {splitWord, propMap} = statementPartParser;
            for(const key in propMap){
                const subStringToParse = parsedObj[key] as string;
                if(subStringToParse === undefined) continue;
                const split = subStringToParse.split(splitWord);
                const parsedSubObjs = [];
                for(const token of split){
                    const subTest = await tryParse(token, propMap[key]);
                    if(subTest === null) continue;
                    const subObj = toParsedObj(subTest);
                    parsedSubObjs.push(subObj);
                }
                
                parsedObj[key] = parsedSubObjs;
            }
        }
        if(defaultVals !== undefined){
            Object.assign(parsedObj, defaultVals);
        }
        if(dssKeys !== undefined){
            const { parse } = await import ('../../dss/parse.js');
            for(const dssKey of dssKeys){
                const [partName, destProp] = dssKey;
                const propVal = parsedObj[partName] as string;
                if(propVal === undefined) continue;
                if(destProp.endsWith('[]')){
                    const andSplit = propVal.split(' and ');
                    const newVal = [];
                    for(const token of andSplit){
                        newVal.push(await parse(token));
                    }
                    parsedObj[destProp.substring(0, destProp.length - 2)] = newVal;
                }else{
                    parsedObj[destProp] = await parse(propVal);
                }

            }
        }
        return parsedObj as TParsedObj;
        // const returnObj =  toLcGrp(test.groups);
        // if(def !== undefined){
        //     Object.assign(returnObj, def);
        // }
        // return returnObj as TParsedObj;
    }
    return null;
}

function toParsedObj(groups: any){
    const parsedObj = {} as any;
    for(const k in groups){
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