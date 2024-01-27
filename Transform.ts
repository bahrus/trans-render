import {MountObserver} from 'mount-observer/MountObserver.js';
import {
    PropAttrQueryType, QuenitOfWork, Derivative, 
    IMountOrchestrator, NumberExpression, InterpolatingExpression,
    DerivationCriteria,
    TransformerTarget, 
    onMountStatusChange, RHS, AddEventListener,
    IfInstructions, UnitOfWork, QueryInfo, PropOrComputedProp, ITransformer, XForm, MarkedUpEventTarget, TransformOptions, LHS, WhereConditions
} from './types.js';
import { IMountObserver, MountContext, PipelineStage } from 'mount-observer/types';
export {UnitOfWork, ITransformer, EngagementCtx, XForm} from './types';

export async function Transform<TProps extends {}, TMethods = TProps, TElement = {}>(
    target: TransformerTarget,
    model: TProps & TMethods,
    xform: XForm<TProps, TMethods, TElement>,
    options?: TransformOptions
){
    const xformer =  new Transformer<TProps, TMethods, TElement>(target, model, xform, options!);
    await xformer.do();
    return xformer;
}

export class Transformer<TProps extends {}, TMethods = TProps, TElement = {}> extends EventTarget implements ITransformer<TProps, TMethods, TElement>{
    #mountOrchestrators: Array<MountOrchestrator<TProps, TMethods, TElement>> = [];
    #model: TProps & TMethods;
    get model(){
        return this.#model;
    }
    async updateModel(newModel: TProps & TMethods){
        const {options} = this;
        const {propagator} = options;
        const {___props, ___nestedProps} = propagator!;
        if(___props === undefined){
            this.#model = newModel;
            return;
        }
        if(___nestedProps === undefined){
            Object.assign<TProps & TMethods, TProps & TMethods>(this.#model, newModel);
            return;
        }else{
            for(const prop in newModel){
                if(___nestedProps.has(prop)){
                    const tbd = ___nestedProps.get(prop);
                    const newVal = (<any>newModel)[prop]
                    if(tbd instanceof Transformer){
                        await tbd.updateModel(newVal);
                    }else{
                        Object.assign(tbd, newVal);
                    }
                }
            }
        }
    }
    constructor(
        public target: TransformerTarget,
        model: TProps & TMethods,
        public xform: XForm<TProps, TMethods, TElement>,
        public options: TransformOptions, 
    ){
        super();
        this.#model = model;
        
    }
    async do(){
        const {target, model, xform} = this;
        let {options} = this;
        if(options === undefined){
            options = {};
            this.options = options;
        }
        let {propagator} = options;
        if(propagator === undefined){
            propagator = new EventTarget() as MarkedUpEventTarget;
            options.propagator = propagator;
        }
        if(propagator.___props === undefined){
            propagator.___props = new Set();
        }
        const uows : Array<QuenitOfWork<TProps, TMethods, TElement>> = [];
        for(const key in xform){
            let rhs = (xform[key as LHS<TProps>]) as RHS<TProps, TMethods>;
            switch(typeof rhs){
                case 'number': {
                    if(rhs !== 0) throw 'NI';
                    const qi = await this.calcQI(key, undefined);
                    const {hostPropToAttrMap, localPropCamelCase} = qi;
                    const uow: QuenitOfWork<TProps, TMethods, TElement> = {
                        o: hostPropToAttrMap!.map(x => x.name) as Array<keyof TProps & string>, 
                        d: 0,
                        qi,
                        q: key,
                        s: localPropCamelCase
                    };
                    uows.push(uow);
                    break;
                }

                case 'string':
                    {
                        if(typeof model[rhs as keyof TProps] === 'function'){
                            const qi = await this.calcQI(key, undefined);
                            const {hostPropToAttrMap} = qi;
                            const uow: QuenitOfWork<TProps, TMethods, TElement> = {
                                o: hostPropToAttrMap!.map(x => x.name) as Array<keyof TProps & string>,
                                d: rhs as keyof TMethods & string,
                                qi,
                                q: key
                            };
                            uows.push(uow);
                        }else{
                            const uow: QuenitOfWork<TProps, TMethods, TElement> = {
                                o: [rhs as keyof TProps & string],
                                d: 0,
                                q: key
                            };
                            uows.push(uow);
                        }

                    }
                    break;
                case 'object':
                    {
                        const rhses = arr(rhs) as Array<UnitOfWork<TProps, TMethods, TElement>>;
                        for(const rhsPart of rhses){
                            
                            const uow: QuenitOfWork<TProps, TMethods, TElement> = {
                                //d: 0,
                                ...rhsPart!,
                                q: key
                            };
                            if(uow.o !== undefined && uow.d === undefined) uow.d = 0;
                            uows.push(uow);

                        }

                    }
                    break;
            }

        }

        for(const uow of uows){
            let {q, qi, w} = uow;
            if(qi === undefined) qi = await this.calcQI(q, w);
            qi.w = w;
            const {o, s} = qi;
            if(o!== undefined){
                uow.o = o as PropOrComputedProp<TProps, TMethods>[];
            }
            if(s !== undefined){
                uow.s = s[0];
            }
            const newProcessor = new MountOrchestrator(this, uow, qi);
            await newProcessor.do();
            this.#mountOrchestrators.push(newProcessor);
            await newProcessor.subscribe();
        }
    }
    async calcQI(pqe: string, w: WhereConditions | undefined){
        if(pqe.startsWith('* ')){
            return {
                cssQuery: pqe.substring(2),
            } as QueryInfo
        }
        
        if(pqe === ':root'){
            return {
                isRootQry: true
            } as QueryInfo
        }
        if(!pqe.includes(' ')){
            return {
                localName: pqe
            } as QueryInfo;
        }
        //TODO:  dynamic import of the rest of this method, including other methods it calls.
        const qi: QueryInfo = {};
        const asterSplit = pqe.split('*');
        if(asterSplit.length === 2){
            qi.cssQuery = asterSplit[1].trim();
        }
        const tokens = pqe.split(' ');
        this.processHead(qi, tokens);
        qi.css = await this.#calcCSS(qi, w);
        return qi;
    }

    processHead(qi: QueryInfo, tokens: string[]){
        if(tokens.length === 1) throw 'NI';
        if(tokens.length === 0) return;
        //TODO make non recursive
        const [first, second, ...rest] = tokens;
        switch(first){
            case '-s': {
                qi.localPropCamelCase = second;
                //qi.s = [second];
                break;
            }
            default:{
                if(qi.hostPropToAttrMap === undefined){
                    qi.hostPropToAttrMap = [];
                }
                qi.hostPropToAttrMap.push({
                    type: first as PropAttrQueryType,
                    name: second,
                })
            }
        }
        this.processHead(qi, rest);

        
    }

    async #calcCSS(qi: QueryInfo, w: WhereConditions | undefined): Promise<string>{
        const {cssQuery} = qi;
        if(cssQuery !== undefined) return cssQuery;
        const {localName} = qi;
        if(localName !== undefined) return localName;
        const {hostPropToAttrMap, localPropCamelCase} = qi;;
        if(hostPropToAttrMap === undefined) throw 'NI';
        qi.o = hostPropToAttrMap.map(x => x.name);
        if(localPropCamelCase !== undefined){
            qi.s = [localPropCamelCase];
        }
        let returnStr = hostPropToAttrMap.map(x => {
            const {name, type} = x;
            switch(name){
                case '#':
                    return `#${name}`;
                case '|':
                    return `[itemprop~="${name}"]`;
                case '%':
                    return `[part~="${name}"]`;
                case '@':
                    return `[name="${name}"]`;
                case '.':
                    return `.${name}`;
                case '$':
                    return `[itemscope][itemprop~="${name}"]`;
                case '-o':
                    return `[-o~="${name}"]`;
            }
        }).join('');
        if(localPropCamelCase !== undefined){
            returnStr += `[-s~="${localPropCamelCase}"]`
        }
        return returnStr + (w || '' );
        
    }

    async doUpdate(matchingElement: Element, uow: UnitOfWork<TProps, TMethods, TElement>){
        const {doUpdate} = await import('./trHelpers/doUpdate.js');
        await doUpdate(this, matchingElement, uow);
    }

    async doIfs(matchingElement: Element, uow: UnitOfWork<TProps, TMethods, TElement>, i: IfInstructions<TProps, TMethods, TElement>): Promise<boolean>{
        const {doIfs} = await import('./trHelpers/doIfs.js');
        return await doIfs(this, matchingElement, uow, i);
    }

    async engage(matchingElement: Element, type: onMountStatusChange, uow: UnitOfWork<TProps, TMethods, TElement>, observer: IMountObserver | undefined, mountContext: MountContext){
        const {e} = uow;
        if(e === undefined) return
        const {Engage} = await import('./trHelpers/Engage.js');
        await Engage(this, matchingElement, type, uow, mountContext);
    }

    async getDerivedVal(uow: UnitOfWork<TProps, TMethods, TElement>, d: Derivative<TProps, TMethods, TElement>, matchingElement: Element){
        const {getDerivedVal} = await import('./trHelpers/getDerivedVal.js');
        return await getDerivedVal(this, uow, d, matchingElement);
    }


    async getArrayVal(uow: UnitOfWork<TProps, TMethods, TElement>, u: NumberExpression | InterpolatingExpression){
        const {getArrayVal} = await import('./trHelpers/getArrayVal.js');
        return getArrayVal(this, uow, u);
    }

    async getComplexDerivedVal(uow: UnitOfWork<TProps, TMethods, TElement>, dc: DerivationCriteria<TProps, TMethods>){
        const {getComplexDerivedVal} = await import('./trHelpers/getComplexDerivedVal.js');
        return await getComplexDerivedVal(this, uow, dc);
    }

    getNumberUVal(uow: UnitOfWork<TProps, TMethods, TElement>, d: number){
        const {o} = uow;
        const arrO = arr(o);
        const propName = this.#getPropName(arrO, d);
        const pOrC = arrO[d];
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
        if(typeof val === 'object'  && !Array.isArray(val)){
            Object.assign(matchingElement, val);
            return;
            
        }
        const defaultProp = this.getDefaultProp(matchingElement);
        switch(defaultProp){
            case 'href':
                if(matchingElement instanceof HTMLLinkElement && typeof val === 'boolean'){
                    matchingElement.href = 'https://schema.org/' + (val ? 'True' : 'False');
                    return;
                }
        }
        (<any>matchingElement)[defaultProp] = val;
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

export class MountOrchestrator<TProps extends {}, TMethods = TProps, TElement = {}> extends EventTarget implements IMountOrchestrator<TProps, TMethods> {
    #mountObserver: MountObserver | undefined;
    #matchingElements: WeakRef<Element>[] = [];
    #unitsOfWork: Array<QuenitOfWork<TProps, TMethods, TElement>>
    constructor(
        public transformer: Transformer<TProps, TMethods, TElement>, 
        uows: QuenitOfWork<TProps, TMethods, TElement>, 
        public queryInfo: QueryInfo){
        super();
        this.#unitsOfWork = arr(uows);
    }
    async do(){
        const {transformer, queryInfo} = this;   
        const {options} = transformer;
        const {skipInit} = options;
        const {isRootQry} = queryInfo;
        if(isRootQry){
            const {onMount} = await import('./trHelpers/onMount.js');
            await onMount(
                transformer, this, transformer.target as Element, this.#unitsOfWork, !!skipInit, {initializing: true}, this.#matchingElements 
            )
            return;
        }
        const match = queryInfo.css;// transformer.calcCSS(queryInfo);
        this.#mountObserver = new MountObserver({
            match,
            do:{
                onMount: async (matchingElement, observer, ctx) => {
                    const {onMount} = await import('./trHelpers/onMount.js');
                    await onMount(
                        transformer, this, matchingElement, this.#unitsOfWork, !!skipInit, ctx, this.#matchingElements, observer, 
                        this.#mountObserver!, 
                    )


                },
                onDismount: async(matchingElement, ctx, stage) => {
                    for(const uow of this.#unitsOfWork){
                        this.#cleanUp(matchingElement);
                        await transformer.engage(matchingElement, 'onDismount', uow, ctx, stage);
                    }
                    //TODO remove weak ref from matching elements;
                },
                onDisconnect: async(matchingElement, ctx, stage) => {
                    for(const uow of this.#unitsOfWork){
                        this.#cleanUp(matchingElement);
                        await transformer.engage(matchingElement, 'onDisconnect', uow, ctx, stage);
                    }
                }
            }
        });
    }
    async subscribe(){
        for(const uow of this.#unitsOfWork){
            
            let {o} = uow;
            const p = arr(o) as string[];
            const {target, options, model} = this.transformer;
            const {propagator} = options;
            for(const propName of p){
                if(typeof propName !== 'string') throw 'NI';
                const propsSet = propagator!.___props;
                if(propsSet instanceof Set){
                    if(!propsSet.has(propName)){
                        const {subscribe} = await import('./lib/subscribe2.js');
                        await subscribe(model, propName, propagator!, true);
                    }
                }
                propagator!.addEventListener(propName, e => {
                    const all = this.#cleanUp();
                    for(const matchingElement of all){
                        this.doUpdate(matchingElement, uow);
                    }
                })
            }
            if(Array.isArray(target)){
                throw 'NI';
            }else{
                this.#mountObserver?.observe(target);
            }
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
    async doUpdate(matchingElement: Element, uow: UnitOfWork<TProps, TMethods, TElement>){
        const {d, s, sa, ss} = uow;
        if(d !== undefined || s !== undefined || sa !== undefined || ss !== undefined){
            await this.transformer.doUpdate(matchingElement, uow);
        }
        
    }

    toStdEvt(a: keyof TMethods, matchingElement: Element): AddEventListener<TProps, TMethods>{
        let on = 'click';
        switch(matchingElement.localName){
            case 'input':
                on = 'input';
                break;
            case 'slot':
                on = 'slotchange'
        }
        return {
            on,
            do: a,
        } as AddEventListener<TProps, TMethods>;
    }
}

