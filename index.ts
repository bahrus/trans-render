import {MountObserver} from 'mount-observer/MountObserver.js';
import {
    PropQueryExpression, PropAttrQueryType, Pique, Derivative, 
    IPiqueProcessor as IMountOrchestrator, NumberExpression, InterpolatingExpression,
    ObjectExpression,
    TransformerTarget, 
    onMountStatusChange, RHS,
    IfInstructions, PiqueWOQ, QueryInfo, PropOrComputedProp
} from './types';
import { MountContext, PipelineStage } from 'mount-observer/types';

export function Transform<TProps = any, TMethods = TProps>(
    target: TransformerTarget,
    model: TProps & TMethods,
    piqueMap: Partial<{[key: string]: RHS<TProps, TMethods>}>,
    propagator?: EventTarget, 
){
    return new Transformer<TProps, TMethods>(target, model, piqueMap, propagator);
}

export class Transformer<TProps = any, TMethods = TProps> extends EventTarget {
    #piqueProcessors: Array<MountOrchestrator<TProps, TMethods>>;
    #piques: Array<Pique<TProps, TMethods>> = [];
    constructor(
        public target: TransformerTarget,
        public model: TProps & TMethods,
        //public piqueMap: Partial<{[key in PropQueryExpression]: PiqueWOQ<TProps, TActions>}>,
        public piqueMap: Partial<{[key: string]: RHS<TProps, TMethods>}>,
        public propagator?: EventTarget, 
    ){
        super();
        let prevKey: string | undefined;
        for(const key in piqueMap){
            const newKey = key[0] ==='^' ? prevKey : key;
            prevKey = newKey;
            const rhs = (piqueMap)[newKey as string];
            switch(typeof rhs){
                case 'number': {
                    if(rhs !== 0) throw 'NI';
                    const qi = this.calcQI(newKey!);
                    const {prop} = qi;
                    const pique: Pique<TProps, TMethods> = {
                        o: [prop! as keyof TProps & string],
                        d: 0,
                        qi,
                        q: newKey!
                    };
                    this.#piques.push(pique);
                    break;
                }

                case 'string':
                    {
                        const pique: Pique<TProps, TMethods> = {
                            o: [rhs],
                            d: 0,
                            q: newKey!
                        };
                        this.#piques.push(pique);
                    }
                    break;
                case 'object':
                    {
                        const pique: Pique<TProps, TMethods> = {
                            d: 0,
                            ...rhs,
                            q: newKey!
                        };
                        this.#piques.push(pique);
                    }
                    break;
            }

        }
        this.#piqueProcessors = [];

        for(const pique of this.#piques){
            let {q, qi} = pique;
            if(qi === undefined) qi = this.calcQI(q);
            const newProcessor = new MountOrchestrator(this, pique, qi);
            this.#piqueProcessors.push(newProcessor);
        }
    }
    calcQI(pqe: string){
        const qi: QueryInfo = {};
        const asterSplit = pqe.split('*');
        if(asterSplit.length === 2){
            qi.cssQuery = asterSplit[1].trim();
        }
        const [beforeAsterisk] = asterSplit;
        const tokens = beforeAsterisk.trim().split(' ');
        let [first, second, third] = tokens;
        const firstChar = first[0];
        if(firstChar >= 'a' && firstChar <= 'z'){
            qi.localName = first;
            [first, second] = [second, third];
        }
        if(first !== undefined){
            qi.propAttrType = first as PropAttrQueryType;
            qi.prop = second;
        }
        return qi;
    }

    calcCSS(qi: QueryInfo){
        const {cssQuery, localName, prop, propAttrType} = qi;
        const ln = localName || '';
        const c = cssQuery || '';
        if(propAttrType === undefined){
            return `${ln} ${c}`.trimEnd();
        } 
        switch(propAttrType){
            case '#':
                return `${ln}#${prop} ${c}`.trimEnd();
            case '$':
                //TODO use scope donut
                return `${ln}[itemprop~="${prop}"] ${c}`.trimEnd();
            case '%':
                return `${ln}[part~="${prop}"] ${c}`.trimEnd();
            case '@':
                return `${ln}[name="${prop}"] ${c}`.trimEnd();
            case '.':
                return `${ln}.${prop} ${c}`.trimEnd();
            case '-':
                return `${ln}-${prop} ${c}`.trimEnd() + ',' + `${ln}data-${prop} ${c}`.trimEnd();

        }
    }

    async doUpdate(matchingElement: Element, piqueProcessor: MountOrchestrator<TProps, TMethods>, u: Derivative<TProps>){
        const {doUpdate} = await import('./aeiou/doUpdate.js');
        await doUpdate(this, matchingElement, piqueProcessor, u);
    }

    async doIfs(matchingElement: Element, piqueProcessor: MountOrchestrator<TProps, TMethods>, i: IfInstructions<TProps>){
        const {doIfs} = await import('./aeiou/doIfs.js');
        await doIfs(this, matchingElement, piqueProcessor, i);
    }

    async doEnhance(matchingElement: Element, type: onMountStatusChange, piqueProcessor: MountOrchestrator<TProps, TMethods>, mountContext: MountContext, stage: PipelineStage | undefined){
        const {doEnhance} = await import('./aeiou/doEnhance.js');
        await doEnhance(this, matchingElement, type, piqueProcessor, mountContext, stage);
    }

    async getNestedObjVal(piqueProcessor: MountOrchestrator<TProps, TMethods>, u: ObjectExpression<TProps>){
        const {getNestedObjVal} = await import('./aeiou/getNestedObjVal.js');
        return await getNestedObjVal(this, piqueProcessor, u);
    }

    getArrayVal(piqueProcessor: MountOrchestrator<TProps, TMethods>, u: NumberExpression | InterpolatingExpression){
        if(u.length === 1 && typeof u[0] === 'number') return u[0];
        const mapped = u.map(x => {
            switch(typeof x){
                case 'number':
                    return this.getNumberUVal(piqueProcessor, x);
                case 'string':
                    return x;
                default:
                    throw 'NI';
            }
        });
        return mapped.join('');
    }

    getNumberUVal(piqueProcessor: MountOrchestrator<TProps, TMethods>, d: number){
        const {pique} = piqueProcessor;
        const {o} = pique;
        const propName = this.#getPropName(arr(o), d);
        const pOrC = o[d];
        const model = this.model as any;
        let val = model[propName as keyof TProps];
        if(Array.isArray(pOrC)){
            const c = pOrC[1];
            if(typeof c === 'function'){
                val = c(val);
            }else{
                val = model[c](val);
            }
        }
        return val;
    }

    #getPropName(p: Array<PropOrComputedProp<TProps, TMethods>>, n: number){
        const pOrC = p[n];
        if(Array.isArray(pOrC)) return pOrC[0];
        return pOrC;
    }

    setPrimeValue(matchingElement: Element, val: any){
        (<any>matchingElement)[this.getDefaultProp(matchingElement)] = val;
    }

    getDefaultProp(matchingElement: Element){
        if('href' in matchingElement) return 'href';
        if('value' in matchingElement && !('button-li'.includes(matchingElement.localName))) return 'value';
        return 'textContent';
    }

    
}

export function arr<T = any>(inp: T | T[] | undefined) : T[] {
    return inp === undefined ? []
        : Array.isArray(inp) ? inp : [inp];
}

export class MountOrchestrator<TProps, TMethods = TProps> extends EventTarget implements IMountOrchestrator<TProps, TMethods> {
    #mountObserver: MountObserver;
    #matchingElements: WeakRef<Element>[] = [];
    constructor(public transformer: Transformer, public pique: Pique<TProps, TMethods>, public queryInfo: QueryInfo){
        super();
        
        const {o: p} = pique;
        const match = transformer.calcCSS(queryInfo);
        this.#mountObserver = new MountObserver({
            match,
            do:{
                onMount: async (matchingElement, ctx, stage) => {
                    await this.doUpdate(matchingElement);
                    this.#matchingElements.push(new WeakRef(matchingElement));
                    await transformer.doEnhance(matchingElement, 'onMount', this, ctx, stage);

                },
                onDismount: async(matchingElement, ctx, stage) => {
                    this.#cleanUp(matchingElement);
                    await transformer.doEnhance(matchingElement, 'onDismount', this, ctx, stage);
                    //TODO remove weak ref from matching eleents;
                },
                onDisconnect: async(matchingElement, ctx, stage) => {
                    this.#cleanUp(matchingElement);
                    await transformer.doEnhance(matchingElement, 'onDisconnect', this, ctx, stage);
                }
            }
        });
        const {target, propagator} = transformer;
        if(propagator !== undefined){
            for(const propName of (p as string[])){
                propagator.addEventListener(propName, e => {
                    const all = this.#cleanUp();
                    for(const matchingElement of all){
                        this.doUpdate(matchingElement);
                    }
                })
            }
        }
        if(Array.isArray(target)){
            throw 'NI';
        }else{
            this.#mountObserver.observe(target);
        }
        
    }
    #cleanUp(matchingElement?: Element){
        const newRefs: WeakRef<Element>[] = [];
        const all: Element[] = [];
        for(const ref of this.#matchingElements){
            const deref = ref.deref();
            if(deref !== undefined && deref !== matchingElement){
                newRefs.push(ref);
                all.push(deref);
            }
        }
        return all;
    }
    async doUpdate(matchingElement: Element){
        const {d, i} = this.pique;
        if(d !== undefined){
            await this.transformer.doUpdate(matchingElement, this, d);
        }
        if(i !== undefined){
            await this.transformer.doIfs(matchingElement, this, i);
        }
    }
}

