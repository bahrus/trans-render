import {MountObserver} from 'mount-observer/MountObserver.js';
import {TransformerTarget, Model, FragmentManifest, QueryInfo, PropQueryExpression, PropAttrQueryType, Pique, UpdateInstruction} from './types';
import { MountContext, PipelineStage } from '../mount-observer/types';

export class Transformer<TModel = any> extends EventTarget {
    #piqueProcessors: Array<PiqueProcessor>;
    constructor(
        public target: TransformerTarget, 
        public model: Model,
        public manifest: FragmentManifest<TModel>,
        public propagator?: EventTarget,
    ){
        super();
        let {piques, piqueMap} = manifest;
        if(piques === undefined){
            if(piqueMap === undefined) throw 400;
            piques = [];
            for(const key in piqueMap){
                const piqueWOQ = (piqueMap as any)[key];
                const pique: Pique<TModel> = {
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

    doUpdate(matchingElement: Element, piqueProcessor: PiqueProcessor, u: UpdateInstruction){
        switch(typeof u){
            case 'number':
                this.doNumberU(matchingElement, piqueProcessor, u);
        }
    }

    doNumberU(matchingElement: Element, piqueProcessor: PiqueProcessor, u: number){
        const {pique} = piqueProcessor;
        const {p} = pique;
        const propName = (p as string[])[u];
        const val = this.model[propName];
        this.setPrimeValue(matchingElement, val);
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

export class PiqueProcessor extends EventTarget{
    #mountObserver: MountObserver;
    #matchingElements: WeakRef<Element>[] = [];
    constructor(public transformer: Transformer, public pique: Pique<any>, public queryInfo: QueryInfo){
        super();
        
        const {p, q} = pique;
        const match = transformer.calcCSS(queryInfo);
        this.#mountObserver = new MountObserver({
            match,
            do:{
                onMount: async (matchingElement) => {
                    this.doUpdate(matchingElement);
                    this.#matchingElements.push(new WeakRef(matchingElement));
                },
                onDismount: async(matchingElement) => {
                    this.#cleanUp(matchingElement);
                    //TODO remove weak ref from matching eleents;
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
    #attachedEvents = false;
    doUpdate(matchingElement: Element){
        const {e, u} = this.pique;
        if(e !== undefined && !this.#attachedEvents){
            this.#attachedEvents = true;
        }
        if(u !== undefined){
            this.transformer.doUpdate(matchingElement, this, u);
        }
    }
}