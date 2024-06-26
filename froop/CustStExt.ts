import { O } from "./O.js";
export class CustStExt {
    #acs: AbortController[] = [];
    constructor(instance: O, internals: ElementInternals, 
        public customStatesToReflect: string,
        public splitSplit: string[][]){
        this.#do(instance, internals);
    }

    async #do(instance: O, internals: ElementInternals){
        const {propagator} = instance;
        for(const statement of this.splitSplit){
            const [customStateKey, expr] = statement;
            const re = new RegExp(String.raw `^(?<lhs>.*)(?<op>==|>|>=|<|<=)(?<rhs>.*)`);
            const test = re.exec(expr);
            
            const {groups} = <any>test;
            const parsedExpr = {
                lhs: groups.lhs.trim(),
                op: groups.op,
                rhs: groups.rhs.trim(),
            } as ParsedExpr;
            const re2 = new RegExp(String.raw `^(?<prop>[\w]+)`);
            if(re2 !== null){
                const propName = parsedExpr.lhs;
                propagator.addEventListener(propName, e => {
                    this.#simpleCompare(instance, internals, parsedExpr, propName, customStateKey);
                });
                this.#simpleCompare(instance, internals, parsedExpr, propName, customStateKey);
            }
            console.log({parsedExpr, test, expr})
        }
    }

    #simpleCompare(
        instance: O, internals: ElementInternals, 
        parsedExpr: ParsedExpr, propName: string,
        customStateKey: string,
    ){
        const val = (<any>instance)[propName!];
        const {op, rhs} = parsedExpr;
        //let method : 'add' | 'delete' = 'delete';
        switch(op){
            case '==':{
                if(val === null || val === undefined){
                    (<any>internals).states.delete(customStateKey);
                    return;
                }
                const method = val.toString() === rhs ? 'add' : 'delete';
                (<any>internals).states[method](customStateKey);
                return;
            }
            default:
                throw 'NI';
        }
    }
    
}

interface ParsedExpr {
    lhs: string,
    op: '==' | '<' | '<=' | '>=' | '>',
    rhs: string,
}