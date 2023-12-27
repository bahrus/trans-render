import { RegExpOrRegExpExt } from "../types";

export function tryParse<TStatementGroup = any>(
    s: string, 
    regExpOrRegExpExt: RegExpOrRegExpExt<TStatementGroup> | RegExpOrRegExpExt<TStatementGroup>[],
    reviver?: (s: string) => string
    ){
    const reArr = arr(regExpOrRegExpExt);
    for(const reOrRegExt of reArr){
        let re: RegExp | undefined;
        let def: TStatementGroup | undefined;
        if(reOrRegExt instanceof RegExp){
            re = reOrRegExt;
        }else{
            re = reOrRegExt.regExp;
            def = reOrRegExt.defaultVals;
        }
        const test = re.exec(s);
        if(test === null) continue;
        const returnObj =  revive(test.groups, reviver);
        if(def !== undefined){
            Object.assign(returnObj, def);
        }
        return returnObj;
    }
    return null;
}

export function arr<T = any>(inp: T | T[] | undefined) : T[] {
    return inp === undefined ? []
        : Array.isArray(inp) ? inp : [inp];
}

export function revive(groups: any, reviver?: (s: string) => string){
    const lcGroup = {} as any;
    for(const k in groups){
        const val = groups[k];
        const rhs = reviver ? reviver(val) : val;
        lcGroup[k] = rhs;
    }
    return lcGroup;
}