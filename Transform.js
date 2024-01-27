import { MountObserver } from 'mount-observer/MountObserver.js';
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
            let rhs = (xform[key]);
            switch (typeof rhs) {
                case 'number': {
                    if (rhs !== 0)
                        throw 'NI';
                    const qi = await this.calcQI(key, undefined);
                    const { prop, localPropCamelCase } = qi;
                    const uow = {
                        o: [prop],
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
                            const qi = await this.calcQI(key, undefined);
                            const { prop } = qi;
                            const uow = {
                                o: [prop],
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
                        const rhses = arr(rhs);
                        for (const rhsPart of rhses) {
                            const uow = {
                                //d: 0,
                                ...rhsPart,
                                q: key
                            };
                            if (uow.o !== undefined && uow.d === undefined)
                                uow.d = 0;
                            uows.push(uow);
                        }
                    }
                    break;
            }
        }
        for (const uow of uows) {
            let { q, qi, w } = uow;
            if (qi === undefined)
                qi = await this.calcQI(q, w);
            qi.w = w;
            const { o, s } = qi;
            if (o !== undefined) {
                uow.o = o;
            }
            if (s !== undefined) {
                uow.s = s[0];
            }
            const newProcessor = new MountOrchestrator(this, uow, qi);
            await newProcessor.do();
            this.#mountOrchestrators.push(newProcessor);
            await newProcessor.subscribe();
        }
    }
    async calcQI(pqe, w) {
        if (pqe.startsWith('* ')) {
            return {
                cssQuery: pqe.substring(2),
            };
        }
        if (pqe === ':root') {
            return {
                isRootQry: true
            };
        }
        if (!pqe.includes(' ')) {
            return {
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
        this.processHead(qi, tokens);
        qi.css = await this.#calcCSS(qi, w);
        return qi;
    }
    processHead(qi, tokens) {
        if (tokens.length === 1)
            throw 'NI';
        if (tokens.length === 0)
            return;
        //TODO make non recursive
        const [first, second, ...rest] = tokens;
        switch (first) {
            case '-s': {
                qi.localPropCamelCase = second;
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
        this.processHead(qi, rest);
    }
    async #calcCSS(qi, w) {
        throw 'NI';
        // const {cssQuery, localName, prop, propAttrType, o, s} = qi;
        // const ln = (localName || '') + (w || '' );
        // const c = cssQuery || '';
        // let returnStr: string;
        // if(propAttrType === undefined){
        //     returnStr = `${ln} ${c}`.trimEnd();
        // }else{
        //     switch(propAttrType){
        //         case '#':
        //             returnStr = `${ln}#${prop} ${c}`.trimEnd();
        //             break;
        //         case '|':
        //             //TODO use scope donut
        //             returnStr = `${ln}[itemprop~="${prop}"] ${c}`.trimEnd();
        //             break;
        //         case '%':
        //             returnStr = `${ln}[part~="${prop}"] ${c}`.trimEnd();
        //             break;
        //         case '@':
        //             returnStr = `${ln}[name="${prop}"] ${c}`.trimEnd();
        //             break;
        //         case '.':
        //             returnStr = `${ln}.${prop} ${c}`.trimEnd();
        //             break;
        //         // case '-':
        //         //     throw 'NI';
        //         case '$':
        //             returnStr = `${ln}[itemscope][itemprop~="${prop}"] ${c}`.trimEnd();
        //             break;
        //     }
        // }
        // if(o !== undefined){
        //     returnStr += o.map(x => `[-o~="${x}"]`).join('');
        // }
        // if(s !== undefined){
        //     returnStr += s.map(x => `[-s~="${x}"]`).join('');
        // }
        // return returnStr;
    }
    async doUpdate(matchingElement, uow) {
        const { doUpdate } = await import('./trHelpers/doUpdate.js');
        await doUpdate(this, matchingElement, uow);
    }
    async doIfs(matchingElement, uow, i) {
        const { doIfs } = await import('./trHelpers/doIfs.js');
        return await doIfs(this, matchingElement, uow, i);
    }
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
        const arrO = arr(o);
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
    setPrimeValue(matchingElement, val) {
        if (typeof val === 'object' && !Array.isArray(val)) {
            Object.assign(matchingElement, val);
            return;
        }
        const defaultProp = this.getDefaultProp(matchingElement);
        switch (defaultProp) {
            case 'href':
                if (matchingElement instanceof HTMLLinkElement && typeof val === 'boolean') {
                    matchingElement.href = 'https://schema.org/' + (val ? 'True' : 'False');
                    return;
                }
        }
        matchingElement[defaultProp] = val;
    }
    getDefaultProp(matchingElement) {
        if ('href' in matchingElement)
            return 'href';
        if ('value' in matchingElement && !('button-li'.includes(matchingElement.localName)))
            return 'value';
        return 'textContent';
    }
}
export function arr(inp) {
    return inp === undefined ? []
        : Array.isArray(inp) ? inp : [inp];
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
        this.#unitsOfWork = arr(uows);
    }
    async do() {
        const { transformer, queryInfo } = this;
        const { options } = transformer;
        const { skipInit } = options;
        const { isRootQry } = queryInfo;
        if (isRootQry) {
            const { onMount } = await import('./trHelpers/onMount.js');
            await onMount(transformer, this, transformer.target, this.#unitsOfWork, !!skipInit, { initializing: true }, this.#matchingElements);
            return;
        }
        const match = queryInfo.css; // transformer.calcCSS(queryInfo);
        this.#mountObserver = new MountObserver({
            match,
            do: {
                onMount: async (matchingElement, observer, ctx) => {
                    const { onMount } = await import('./trHelpers/onMount.js');
                    await onMount(transformer, this, matchingElement, this.#unitsOfWork, !!skipInit, ctx, this.#matchingElements, observer, this.#mountObserver);
                },
                onDismount: async (matchingElement, ctx, stage) => {
                    for (const uow of this.#unitsOfWork) {
                        this.#cleanUp(matchingElement);
                        await transformer.engage(matchingElement, 'onDismount', uow, ctx, stage);
                    }
                    //TODO remove weak ref from matching elements;
                },
                onDisconnect: async (matchingElement, ctx, stage) => {
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
            // if(o === undefined && qi !== undefined){
            //     const {o: o2} = qi;
            //     if(o2 !== undefined){
            //         uow.o = o2 as PropOrComputedProp<TProps, TMethods>[];
            //         o = o2 as PropOrComputedProp<TProps, TMethods>[];
            //     }
            // }
            const p = arr(o);
            const { target, options, model } = this.transformer;
            const { propagator } = options;
            for (const propName of p) {
                if (typeof propName !== 'string')
                    throw 'NI';
                const propsSet = propagator.___props;
                if (propsSet instanceof Set) {
                    if (!propsSet.has(propName)) {
                        const { subscribe } = await import('./lib/subscribe2.js');
                        await subscribe(model, propName, propagator, true);
                    }
                }
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
        const { d, s, sa, ss } = uow;
        if (d !== undefined || s !== undefined || sa !== undefined || ss !== undefined) {
            await this.transformer.doUpdate(matchingElement, uow);
        }
    }
    toStdEvt(a, matchingElement) {
        let on = 'click';
        switch (matchingElement.localName) {
            case 'input':
                on = 'input';
                break;
            case 'slot':
                on = 'slotchange';
        }
        return {
            on,
            do: a,
        };
    }
}
