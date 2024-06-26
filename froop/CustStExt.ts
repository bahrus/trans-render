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
            const test3 = re2.exec(parsedExpr.lhs)
            if(test3 !== null){
                const propName = parsedExpr.lhs;
                propagator.addEventListener(propName, e => {
                    this.#simpleCompare(instance, internals, parsedExpr, propName, customStateKey);
                });
                this.#simpleCompare(instance, internals, parsedExpr, propName, customStateKey);
                continue;
            }
            //const re3
        }
    }

    #simpleCompare(
        instance: O, internals: ElementInternals, 
        parsedExpr: ParsedExpr, propName: string,
        customStateKey: string,
    ){
        const val = (<any>instance)[propName!];
        if(val === null || val === undefined){
            (<any>internals).states.delete(customStateKey);
            return;
        }
        const {op, rhs} = parsedExpr;
        let method: 'add' | 'delete' | undefined;
        switch(op){
            case '==':{
                method = val.toString() === rhs ? 'add' : 'delete';
                break;
            }
            case '>=':
            case '<=':
            case '<':
            case '>':{
                const t = this.#getType(instance, propName);
                const rhsM = t === 'Number' ? Number(rhs) : rhs;
                const lhsM = t === 'Number' ? val : val.toString();
                switch(op){
                    case '>':
                        method = lhsM > rhsM ? 'add' : 'delete';
                        break;
                    case '<':
                        method = lhsM < rhsM ? 'add' : 'delete';
                        break;
                    case '>=':
                        method = lhsM >= rhsM ? 'add' : 'delete';
                        break;
                    case '<=':
                        method = lhsM <= rhsM ? 'add' : 'delete';
                        break;
                }
                console.log({t});
                break;
            }
            default:
                throw 'NI';
        }
        (<any>internals).states[method](customStateKey);
    }

    #getType(instance: O, propName: string){
        return (<any>instance.constructor).props[propName].type;
    }
    
}

interface ParsedExpr {
    lhs: string,
    op: '==' | '<' | '<=' | '>=' | '>',
    rhs: string,
}