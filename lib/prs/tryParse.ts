import { arr } from '../arr.js';
import { RegExpExt, RegExpOrRegExpExt, StatementPartParser } from '../../ts-refs/trans-render/lib/prs/types.js'; 
export { RegExpOrRegExpExt } from '../../ts-refs/trans-render/lib/prs/types.js'; 
import {reNormalize} from '../../Object$entences.js'

export async function tryParse<TParsedObj = any>(
    s: string, 
    regExpOrRegExpExt: RegExpOrRegExpExt<TParsedObj> | RegExpOrRegExpExt<TParsedObj>[]
){
    const reArr = arr(regExpOrRegExpExt);
    for(const reOrRegExt of reArr){
        let re: RegExp | undefined;
        let defaultVals: Partial<TParsedObj> | undefined;
        let dssKeys: [string, string][] | undefined;
        let dssArrayKeys: [string, string][] | undefined;
        let statementPartParser: StatementPartParser | undefined;
        if(reOrRegExt instanceof RegExp){
            re = reOrRegExt;
        }else{
            re = reOrRegExt.regExp as RegExp;
            defaultVals = reOrRegExt.defaultVals;
            dssKeys = reOrRegExt.dssKeys;
            dssArrayKeys = reOrRegExt.dssArrayKeys;
            statementPartParser = reOrRegExt.statementPartParser;
        }
        const test = re.exec(s);
        if(test === null) continue;
        const groups = test.groups;
        if(groups === undefined) continue;
        const parsedObj = toParsedObj(groups);
        if(statementPartParser !== undefined){
            //TODO:  move to a separate file
            const {splitWord, propMap} = statementPartParser;
            if(!statementPartParser.parsedRegExps){
                for(const key in propMap){
                    const rhs = propMap[key];
                    for(const regexpExt of rhs){
                        if(!(regexpExt.regExp instanceof RegExp)){
                            regexpExt.regExp = new RegExp(regexpExt.regExp);
                        }
                    }
                }
                statementPartParser.parsedRegExps = true;
            }
            for(const key in propMap){
                const subStringToParse = parsedObj[key] as string;
                if(subStringToParse === undefined) continue;
                const split = subStringToParse.split(splitWord)
                .map(s => s.trim())
                .filter(s => !s.startsWith('//'))
                .map(s => s.replace(reNormalize, ' '))
                .filter(s => s !== '');
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
        if(dssKeys!== undefined){
            const { parse } = await import ('../../dss/parse.js');
            if(dssKeys !== undefined){
                for(const dssKey of dssKeys){
                    const [partName, destProp] = dssKey;
                    const propVal = parsedObj[partName] as string;
                    if(propVal === undefined) continue;
                    parsedObj[destProp] = await parse(propVal);
    
                }
            }
        }
        if(dssArrayKeys !== undefined){
            const {DSSArray} = await import('../../DSSArray.js');
            for(const dssArrayKey of dssArrayKeys){
                const [partName, destProp] = dssArrayKey;
                const propVal = parsedObj[partName] as string;
                if(propVal === undefined) continue;
                const dssArrayParser = new DSSArray(propVal);
                await dssArrayParser.parse();
                parsedObj[destProp] = dssArrayParser.arrVal;
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
        const val = groups[k];
        parsedObj[k] = val;
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