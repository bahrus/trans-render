import { arr } from '../arr.js';
import { RegExpOrRegExpExt } from './types';

export function tryParse<TParsedObj = any>(s: string, regExpOrRegExpExt: RegExpOrRegExpExt<TParsedObj> | RegExpOrRegExpExt<TParsedObj>[]){
    const reArr = arr(regExpOrRegExpExt);
    for(const reOrRegExt of reArr){
        let re: RegExp | undefined;
        let def: Partial<TParsedObj> | undefined;
        if(reOrRegExt instanceof RegExp){
            re = reOrRegExt;
        }else{
            re = reOrRegExt.regExp;
            def = reOrRegExt.defaultVals;
        }
        const test = re.exec(s);
        if(test === null) continue;
        const returnObj =  toLcGrp(test.groups);
        if(def !== undefined){
            Object.assign(returnObj, def);
        }
        return returnObj as TParsedObj;
    }
    return null;
}

function toLcGrp(groups: any){
    const lcGroup = {} as any;
    for(const k in groups){
        const val = groups[k];
        const rhs = lc(val);
        lcGroup[k] = rhs;
    }
    return lcGroup;
}

function lc(s: string){
    if(!s) return s;
    return s[0].toLowerCase() + s.substring(1);
}