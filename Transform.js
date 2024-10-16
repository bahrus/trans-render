import { MountObserver } from 'mount-observer/MountObserver.js';
import { arr0 } from './arr.js';
export { arr0 } from './arr.js';
import { stdEvt } from './asmr/stdEvt.js';
export async function Transform(target, model, xform, options) {
    const xformer = new Transformer(target, model, xform, options);
    await xformer.do();
    return xformer;
}
export class Transformer extends EventTarget {
    target;
    xform;
    options;
    #mountOrchestrators = [];
    #model;
    initializedMods = new Set();
    get model() {
        return this.#model;
    }
    async updateModel(newModel) {
        const { options } = this;
        const { propagator } = options;
        const { ___props, ___nestedProps } = propagator;
        if (___props === undefined) {
            this.#model = newModel;
            return;
        }
        if (___nestedProps === undefined) {
            Object.assign(this.#model, newModel);
            return;
        }
        else {
            for (const prop in newModel) {
                if (___nestedProps.has(prop)) {
                    const tbd = ___nestedProps.get(prop);
                    const newVal = newModel[prop];
                    if (tbd instanceof Transformer) {
                        await tbd.updateModel(newVal);
                    }
                    else {
                        Object.assign(tbd, newVal);
                    }
                }
            }
        }
    }
    constructor(target, model, xform, options) {
        super();
        this.target = target;
        this.xform = xform;
        this.options = options;
        this.#model = model;
    }
    async do() {
        const { target, model, xform } = this;
        const info = xform;
        let { options } = this;
        if (options === undefined) {
            options = {};
            this.options = options;
        }
        let { propagator } = options;
        if (propagator === undefined) {
            propagator = new EventTarget();
            options.propagator = propagator;
        }
        if (propagator.___props === undefined) {
            propagator.___props = new Set();
        }
        const uows = [];
        for (const key in xform) {
            if (key === '411')
                continue;
            let rhs = (xform[key]);
            switch (typeof rhs) {
                case 'number': {
                    if (rhs !== 0)
                        throw 'NI';
                    const qi = await this.calcQI(key);
                    const { hostPropToAttrMap, localPropCamelCase } = qi;
                    const uow = {
                        o: hostPropToAttrMap.map(x => x.name),
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
                        if (typeof model[rhs] === 'function') {
                            const qi = await this.calcQI(key);
                            const { hostPropToAttrMap } = qi;
                            const uow = {
                                o: hostPropToAttrMap.map(x => x.name),
                                d: rhs,
                                qi,
                                q: key
                            };
                            uows.push(uow);
                        }
                        else {
                            const uow = {
                                o: [rhs],
                                d: 0,
                                q: key
                            };
                            uows.push(uow);
                        }
                    }
                    break;
                case 'object':
                    {
                        const rhses = arr0(rhs);
                        for (const rhsPart of rhses) {
                            const uow = {
                                //d: 0,
                                ...rhsPart,
                                q: key
                            };
                            const { m, e, a, f } = uow;
                            if ((m || e || a || f) === undefined) {
                                if (uow.o === undefined) {
                                    const qi = await this.calcQI(key);
                                    const { hostPropToAttrMap } = qi;
                                    if (hostPropToAttrMap !== undefined) {
                                        uow.o = hostPropToAttrMap.filter(x => x.name in model).map(x => x.name);
                                    }
                                }
                                const { o } = uow;
                                if (o !== undefined && !(Array.isArray(o) && o.length === 0) && uow.d === undefined)
                                    uow.d = 0;
                            }
                            uows.push(uow);
                        }
                    }
                    break;
            }
        }
        for (const uow of uows) {
            let { q, qi, y } = uow;
            if (qi === undefined)
                qi = await this.calcQI(q);
            //qi.w = w;
            const { o, s } = qi;
            if (o !== undefined) {
                uow.o = o;
            }
            if (s !== undefined) {
                uow.s = s[0];
            }
            if (y !== undefined) {
                uow.d = 0;
            }
            const newProcessor = new MountOrchestrator(this, uow, qi);
            await newProcessor.do();
            this.#mountOrchestrators.push(newProcessor);
            await newProcessor.subscribe();
        }
    }
    async calcQI(pqe) {
        if (pqe.startsWith('* ')) {
            const cssQuery = pqe.substring(2);
            return {
                css: cssQuery,
                cssQuery
            };
        }
        if (pqe === ':root') {
            return {
                isRootQry: true
            };
        }
        if (!pqe.includes(' ')) {
            return {
                css: pqe,
                localName: pqe
            };
        }
        //TODO:  dynamic import of the rest of this method, including other methods it calls.
        const qi = {};
        const asterSplit = pqe.split('*');
        if (asterSplit.length === 2) {
            qi.cssQuery = asterSplit[1].trim();
        }
        const tokens = pqe.split(' ');
        if (tokens.length === 1)
            throw 'NI';
        let currentTokens = tokens;
        while (currentTokens.length > 0) {
            const [first, second, ...rest] = currentTokens;
            switch (first) {
                case '-s': {
                    qi.localPropCamelCase = second;
                    //qi.s = [second];
                    break;
                }
                default: {
                    if (qi.hostPropToAttrMap === undefined) {
                        qi.hostPropToAttrMap = [];
                    }
                    qi.hostPropToAttrMap.push({
                        type: first,
                        name: second,
                    });
                }
            }
            currentTokens = rest;
        }
        qi.css = await this.#calcCSS(qi);
        return qi;
    }
    async #calcCSS(qi) {
        const { cssQuery } = qi;
        if (cssQuery !== undefined)
            return cssQuery;
        const { localName } = qi;
        if (localName !== undefined)
            return localName;
        const { hostPropToAttrMap, localPropCamelCase } = qi;
        ;
        if (hostPropToAttrMap === undefined)
            throw 'NI';
        qi.o = hostPropToAttrMap.map(x => x.name);
        if (localPropCamelCase !== undefined) {
            qi.s = [localPropCamelCase];
        }
        let returnStr = hostPropToAttrMap.map(x => {
            const { name, type } = x;
            switch (type) {
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
        if (localPropCamelCase !== undefined) {
            returnStr += `[-s~="${localPropCamelCase}"]`;
        }
        return returnStr;
    }
    async doUpdate(matchingElement, uow) {
        const { doUpdate } = await import('./trHelpers/doUpdate.js');
        await doUpdate(this, matchingElement, uow);
    }
    async doIfs(matchingElement, uow, i) {
        const { doIfs } = await import('./trHelpers/doIfs.js');
        return await doIfs(this, matchingElement, uow, i);
    }
    // async doYield(matchingElement: Element, uow: UnitOfWork<TProps, TMethods, TElement>, y: YieldSettings<TProps>){
    //     const {doYield} = await import('./trHelpers/doYield.js');
    //     return await doYield(this, matchingElement, uow, y);
    // }
    async engage(matchingElement, type, uow, observer, mountContext) {
        const { e } = uow;
        if (e === undefined)
            return;
        const { Engage } = await import('./trHelpers/Engage.js');
        await Engage(this, matchingElement, type, uow, mountContext);
    }
    async getDerivedVal(uow, d, matchingElement) {
        const { getDerivedVal } = await import('./trHelpers/getDerivedVal.js');
        return await getDerivedVal(this, uow, d, matchingElement);
    }
    async getArrayVal(uow, u) {
        const { getArrayVal } = await import('./trHelpers/getArrayVal.js');
        return getArrayVal(this, uow, u);
    }
    async getComplexDerivedVal(uow, dc) {
        const { getComplexDerivedVal } = await import('./trHelpers/getComplexDerivedVal.js');
        return await getComplexDerivedVal(this, uow, dc);
    }
    getNumberUVal(uow, d) {
        const { o } = uow;
        const arrO = arr0(o);
        const propName = this.#getPropName(arrO, d);
        const pOrC = arrO[d];
        const model = this.model;
        let val = model[propName];
        if (Array.isArray(pOrC)) {
            const c = pOrC[1];
            if (typeof c === 'function') {
                val = c(val);
            }
            else {
                val = model[c](val);
            }
        }
        return val;
    }
    #getPropName(p, n) {
        const pOrC = p[n];
        if (Array.isArray(pOrC))
            return pOrC[0];
        return pOrC;
    }
}
export class MountOrchestrator extends EventTarget {
    transformer;
    queryInfo;
    #mountObserver;
    #matchingElements = [];
    #unitsOfWork;
    constructor(transformer, uows, queryInfo) {
        super();
        this.transformer = transformer;
        this.queryInfo = queryInfo;
        this.#unitsOfWork = arr0(uows);
    }
    async do() {
        const { transformer, queryInfo } = this;
        const { options, xform } = transformer;
        const { skipInit } = options;
        const { isRootQry } = queryInfo;
        if (isRootQry) {
            const { onMount } = await import('./trHelpers/onMount.js');
            await onMount(transformer, this, transformer.target, this.#unitsOfWork, !!skipInit, { initializing: true }, this.#matchingElements);
            return;
        }
        const info = xform;
        const w = info?.[411]?.w;
        const x = w || '';
        const on = queryInfo.css + x; // transformer.calcCSS(queryInfo);
        this.#mountObserver = new MountObserver({
            on,
            do: {
                mount: async (matchingElement, observer, ctx) => {
                    const { onMount } = await import('./trHelpers/onMount.js');
                    await onMount(transformer, this, matchingElement, this.#unitsOfWork, !!skipInit, ctx, this.#matchingElements, observer, this.#mountObserver);
                },
                dismount: async (matchingElement, ctx, stage) => {
                    for (const uow of this.#unitsOfWork) {
                        this.#cleanUp(matchingElement);
                        await transformer.engage(matchingElement, 'onDismount', uow, ctx, stage);
                    }
                    //TODO remove weak ref from matching elements;
                },
                disconnect: async (matchingElement, ctx, stage) => {
                    for (const uow of this.#unitsOfWork) {
                        this.#cleanUp(matchingElement);
                        await transformer.engage(matchingElement, 'onDisconnect', uow, ctx, stage);
                    }
                }
            }
        });
    }
    async subscribe() {
        for (const uow of this.#unitsOfWork) {
            let { o } = uow;
            const p = arr0(o);
            const { target, options, model } = this.transformer;
            const propagator = (model.propagator || options.propagator);
            const propagatorIsReady = model.propagator ? true : options.propagatorIsReady;
            for (const propName of p) {
                if (typeof propName !== 'string')
                    throw 'NI';
                if (!(propName in model))
                    continue;
                if (!propagatorIsReady) {
                    const propsSet = propagator.___props;
                    if (propsSet instanceof Set) {
                        if (!propsSet.has(propName)) {
                            const { subscribe } = await import('./lib/subscribe2.js');
                            await subscribe(model, propName, propagator, true);
                        }
                    }
                }
                //I'm thinking this event handler doesn't access any memory, hence 
                //risk of memory leaks seems really low.
                propagator.addEventListener(propName, e => {
                    const all = this.#cleanUp();
                    for (const matchingElement of all) {
                        this.doUpdate(matchingElement, uow);
                    }
                });
            }
            if (Array.isArray(target)) {
                throw 'NI';
            }
            else {
                this.#mountObserver?.observe(target);
            }
        }
    }
    #cleanUp(matchingElement) {
        const newRefs = [];
        const all = [];
        for (const ref of this.#matchingElements) {
            const deref = ref.deref();
            if (deref !== undefined && deref !== matchingElement) {
                newRefs.push(ref);
                all.push(deref);
            }
        }
        return all;
    }
    async doUpdate(matchingElement, uow) {
        const { d, s, sa, ss, f } = uow;
        if (d !== undefined || s !== undefined || sa !== undefined || ss !== undefined || f !== undefined) {
            await this.transformer.doUpdate(matchingElement, uow);
        }
    }
    toStdEvt(a, matchingElement) {
        const on = stdEvt(matchingElement);
        return {
            on,
            do: a,
        };
    }
}
