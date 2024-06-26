import { O } from "./O.js";
export class CustStExt {
    #acs: AbortController[] = [];
    constructor(instance: O, internals: ElementInternals, 
        public customStatesToReflect: string,
        public splitSplit: string[][]){
        this.#do(instance, internals);
    }

    async #do(instance: O, internals: ElementInternals){
        for(const statement of this.splitSplit){
            const [customStateKey, expr] = statement;
            const re = new RegExp(String.raw `^(?<lhs>.*)(?<op>==|>|>=|<|<=)(?<rhs>.*)`);
            const test = re.exec(expr);
            
            const {groups} = <any>test;
            const parsedExpr = {
                lhs: groups.lhs.trim(),
                op: groups.op,
                rhs: groups.rhs.trim()
            };
            console.log({parsedExpr, test, expr})
        }
    }
    
}