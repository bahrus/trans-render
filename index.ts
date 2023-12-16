import {MountObserver} from 'mount-observer/MountObserver.js';
import {TransformerTarget, Model, FragmentManifest, QueryInfo, PropQueryExpression, PropAttrQueryType, Pique} from './types';
import { MountContext, PipelineStage } from '../mount-observer/types';

export class Transformer extends EventTarget {
    #piqueProcessors: Array<PiqueProcessor>;
    constructor(
        public target: TransformerTarget, 
        public model: Model,
        public manifest: FragmentManifest){
        super();
        const {piques} = manifest;
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
}

export function arr<T = any>(inp: T | T[] | undefined) : T[] {
    return inp === undefined ? []
        : Array.isArray(inp) ? inp : [inp];
}

export class PiqueProcessor extends EventTarget{
    #mountObserver: MountObserver;
    constructor(public transformer: Transformer, public pique: Pique<any>, public queryInfo: QueryInfo){
        super();
        const {q} = pique;
        this.#mountObserver = new MountObserver({
            match: transformer.calcCSS(queryInfo),
            do:{
                onMount: async (matchingElement) => {
                    this.doUpdate(matchingElement);
                }
            }
        });
    }
    #attachedEvents = false;
    doUpdate(matchingElement: Element){
        const {e} = this.pique;
        if(e !== undefined && !this.#attachedEvents){
            this.#attachedEvents = true;
        }
    }
}