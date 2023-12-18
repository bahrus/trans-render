import {MountObserver} from 'mount-observer/MountObserver.js';
import {
    TransformerTarget, Model, FragmentManifest, QueryInfo, 
    PropQueryExpression, PropAttrQueryType, Pique, UpdateInstruction, 
    IPiqueProcessor, NumberExpression, InterpolatingExpression,
    ObjectExpression,
    MethodInvocationCallback,
    onMountStatusChange,
    IfInstructions,
} from './types';
import { MountContext, PipelineStage } from 'mount-observer/types';

export class Transformer<TProps = any, TActions = TProps> extends EventTarget {
    #piqueProcessors: Array<PiqueProcessor<TProps, TActions>>;
    constructor(
        public target: TransformerTarget,
        public model: Model,
        public manifest: FragmentManifest<TProps, TActions>,
        public propagator?: EventTarget, 
    ){
        super();
        let {piques, piqueMap} = manifest;
        if(piques === undefined){
            if(piqueMap === undefined) throw 400;
            piques = [];
            for(const key in piqueMap){
                const piqueWOQ = (piqueMap as any)[key];
                const pique: Pique<TProps, TActions> = {
                    ...piqueWOQ,
                    q: key
                };
                piques.push(pique);
            }
        }
        this.#piqueProcessors = [];

        for(const pique of piques){
            pique.p = arr(pique.p);
            const {p, q} = pique;
            const qi = this.calcQI(q, p);
            const newProcessor = new PiqueProcessor(this, pique, qi);
            this.#piqueProcessors.push(newProcessor);
        }
    }
    calcQI(pqe: PropQueryExpression, p: string[]){
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
            qi.prop = p[Number(second)];
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

    async doUpdate(matchingElement: Element, piqueProcessor: PiqueProcessor<TProps>, u: UpdateInstruction<TProps>){
        switch(typeof u){
            case 'number':{
                const val = this.getNumberUVal(piqueProcessor, u);
                this.setPrimeValue(matchingElement, val);
                break;
            }
            case 'function':{
                const newU = await u(matchingElement, piqueProcessor);
                if(newU !== undefined){
                    await this.doUpdate(matchingElement, piqueProcessor, newU);
                }
                break;
            }
            case 'object': {
                if(Array.isArray(u)){
                    const val = this.getArrayVal(piqueProcessor, u);
                    this.setPrimeValue(matchingElement, val);
                }else{
                    const val = await this.getNestedObjVal(piqueProcessor, u);
                    Object.assign(matchingElement, val);
                }
            }

        }
        
    }

    async doIfs(matchingElement: Element, piqueProcessor: PiqueProcessor<TProps>, i: IfInstructions<TProps>){
        const iffs = arr(i);
        for(const iff of iffs){
            const {ifAllOf, ifEqual, ifNoneOf, u} = iff;
            if(ifAllOf !== undefined){
                for(const n of ifAllOf){
                    if(!this.getNumberUVal(piqueProcessor, n)) continue;
                }
            }
            if(ifNoneOf !== undefined){
                for(const n of ifNoneOf){
                    if(this.getNumberUVal(piqueProcessor, n)) continue;
                }
            }
            if(ifEqual !== undefined){
                const [lhsN, rhsNorS] = ifEqual;
                const lhs = this.getNumberUVal(piqueProcessor, lhsN);
                let rhs;
                switch(typeof rhsNorS){
                    case 'number':
                        rhs = this.getNumberUVal(piqueProcessor, rhsNorS);
                        break;
                    case 'object':
                        if(Array.isArray(rhsNorS)){
                            [rhs] = rhsNorS;
                        }else{
                            throw 'NI';
                        }
                        break;
                    case 'string':
                        rhs = rhsNorS;
                        break;
                }
                if(lhs !== rhs) continue;
            }
            await this.doUpdate(matchingElement, piqueProcessor, u);
        }
    }

    async doEnhance(matchingElement: Element, type: onMountStatusChange, piqueProcessor: PiqueProcessor<TProps>, mountContext: MountContext, stage: PipelineStage | undefined){
        const {pique} = piqueProcessor;
        const {e} = pique;
        if(e === undefined) return;
        const methodArg: MethodInvocationCallback<TActions> = {
            mountContext,
            stage,
            type
        };
        const model = this.model as any;
        switch(typeof e){
            case 'string':{
                model[e](model, matchingElement, methodArg);
                break;
            }
            case 'object':
                const es = arr(e);
                for(const enhance of es){
                    const {do: d, with: w} = enhance;
                    model[d](model, matchingElement, {
                        ...methodArg,
                        with: w
                    });
                }
                break;
        }

    }

    async getNestedObjVal(piqueProcessor: PiqueProcessor<TProps>, u: ObjectExpression<TProps>){
        const returnObj: Partial<TProps> = {};
        for(const key in u){
            const v = u[key as keyof TProps & string] as UpdateInstruction<TProps>;
            switch(typeof v){
                case 'number':{
                    const val = this.getNumberUVal(piqueProcessor, v);
                    (<any>returnObj)[key as keyof TProps & string] = val;
                    break;
                }
                case 'function':{
                    throw 'NI';
                }
                case 'object': {
                    if(Array.isArray(v)){
                        const val = this.getArrayVal(piqueProcessor, v);
                        (<any>returnObj)[key as keyof TProps & string] = val;
                    }else{
                        const val = this.getNestedObjVal(piqueProcessor, v);
                        (<any>returnObj)[key as keyof TProps & string] = val;
                    }
                }
                case 'boolean':
                case 'string': {
                    (<any>returnObj)[key as keyof TProps & string] = v;
                    break;
                }
                
            }
        }
        return returnObj;
    }

    getArrayVal(piqueProcessor: PiqueProcessor<TProps>, u: NumberExpression | InterpolatingExpression){
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

    getNumberUVal(piqueProcessor: PiqueProcessor<TProps>, u: number){
        const {pique} = piqueProcessor;
        const {p} = pique;
        const propName = (p as string[])[u];
        const val = (<any>this.model)[propName as keyof TProps];
        return val;
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

export class PiqueProcessor<TProps, TActions = TProps> extends EventTarget implements IPiqueProcessor<TProps, TActions> {
    #mountObserver: MountObserver;
    #matchingElements: WeakRef<Element>[] = [];
    constructor(public transformer: Transformer, public pique: Pique<TProps, TActions>, public queryInfo: QueryInfo){
        super();
        
        const {p} = pique;
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
        const {u, i} = this.pique;
        if(u !== undefined){
            await this.transformer.doUpdate(matchingElement, this, u);
        }
        if(i !== undefined){
            await this.transformer.doIfs(matchingElement, this, i);
        }
    }
}

