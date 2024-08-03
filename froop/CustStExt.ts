import { O } from "./O.js";

class SCHandler implements EventListenerObject{
    constructor(
        public instance: O, 
        public internals: ElementInternals, 
        public parsedExpr: ParsedExpr, 
        public propName: string, 
        public customStateKey: string){}
    handleEvent(): void {
        const {internals, customStateKey, instance, parsedExpr, propName} = this;
        const val = (<any>instance)[propName];
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

class ModHandler implements EventListenerObject{
    constructor(
    public instance: O<any, any>,
    public internals: ElementInternals,
    public parsedExpr: ParsedExpr,
    public propName: string,
    public customStateKey: string,
    public modulo: number,
    ){}
    handleEvent(e: Event): void {
        const {internals, customStateKey, instance, parsedExpr, propName, modulo} = this;
        const val = (<any>instance)[propName!];
        if(val === null || val === undefined){
            (<any>internals).states.delete(customStateKey);
            return;
        }
        const method = Number(val) % modulo === Number(parsedExpr.rhs) ? 'add' : 'delete';
        (<any>internals).states[method](customStateKey);
    }
}
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
            const {lhs} = parsedExpr;
            const test3 = re2.exec(lhs);
            if((<any>test3?.groups).prop === lhs){
                const propName = lhs;
                const ac = new AbortController();
                this.#acs.push(ac);
                const sc = new SCHandler(instance, internals, parsedExpr, propName, customStateKey);
                propagator.addEventListener(propName, sc, {signal: ac.signal});
                sc.handleEvent();
                continue;
            }
            const percentSplit = lhs.split('%').map(s => s.trim());
            if(percentSplit.length === 2){
                const [propName, moduloS] = percentSplit;
                const modulo = Number(moduloS);
                const ac = new AbortController();
                this.#acs.push(ac);
                const mh = new ModHandler(instance, internals, parsedExpr, propName, customStateKey, modulo);
                propagator.addEventListener(propName, mh, {signal: ac.signal});
            }
            //no memory access outside closure, I think
            propagator.addEventListener('disconnectedCallback', e => {
                this.#disconnect();
            }, {once: true})
        }
    }


    #disconnect(){
        for(const ac of this.#acs){
            ac.abort();
        }
    }
    
}

interface ParsedExpr {
    lhs: string,
    op: '==' | '<' | '<=' | '>=' | '>',
    rhs: string,
}