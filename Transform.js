import { MountObserver } from 'mount-observer/MountObserver.js';
export async function Transform(target, model, xform, options
//propagator?: EventTarget, 
) {
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
        let prevKey;
        const uows = [];
        for (const key in xform) {
            const newKey = key[0] === '^' ? prevKey : key;
            prevKey = newKey;
            const rhs = (xform)[newKey];
            switch (typeof rhs) {
                case 'number': {
                    if (rhs !== 0)
                        throw 'NI';
                    const qi = this.calcQI(newKey);
                    const { prop } = qi;
                    const uow = {
                        o: [prop],
                        d: 0,
                        qi,
                        q: newKey
                    };
                    uows.push(uow);
                    break;
                }
                case 'string':
                    {
                        if (typeof model[rhs] === 'function') {
                            const qi = this.calcQI(newKey);
                            const { prop } = qi;
                            const uow = {
                                o: [prop],
                                d: rhs,
                                qi,
                                q: newKey
                            };
                            uows.push(uow);
                        }
                        else {
                            const uow = {
                                o: [rhs],
                                d: 0,
                                q: newKey
                            };
                            uows.push(uow);
                        }
                    }
                    break;
                case 'object':
                    {
                        if (Array.isArray(rhs)) {
                            for (const rhsPart of rhs) {
                                const uow = {
                                    //d: 0,
                                    ...rhsPart,
                                    q: newKey
                                };
                                if (uow.o !== undefined && uow.d === undefined)
                                    uow.d = 0;
                                uows.push(uow);
                            }
                        }
                        else {
                            const uow = {
                                //d: 0,
                                ...rhs,
                                q: newKey
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
            let { q, qi } = uow;
            if (qi === undefined)
                qi = this.calcQI(q);
            const newProcessor = new MountOrchestrator(this, uow, qi);
            this.#mountOrchestrators.push(newProcessor);
            await newProcessor.subscribe();
        }
    }
    calcQI(pqe) {
        const qi = {};
        const asterSplit = pqe.split('*');
        if (asterSplit.length === 2) {
            qi.cssQuery = asterSplit[1].trim();
        }
        const [beforeAsterisk] = asterSplit;
        const tokens = beforeAsterisk.trim().split(' ');
        let [first, second, third] = tokens;
        const firstChar = first[0];
        if (firstChar >= 'a' && firstChar <= 'z') {
            qi.localName = first;
            [first, second] = [second, third];
        }
        if (first !== undefined) {
            qi.propAttrType = first;
            qi.prop = second;
        }
        return qi;
    }
    calcCSS(qi) {
        const { cssQuery, localName, prop, propAttrType } = qi;
        const ln = localName || '';
        const c = cssQuery || '';
        if (propAttrType === undefined) {
            return `${ln} ${c}`.trimEnd();
        }
        switch (propAttrType) {
            case '#':
                return `${ln}#${prop} ${c}`.trimEnd();
            case '|':
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
            case '$':
                return `${ln}[itemscope][itemprop~="${prop}"] ${c}`.trimEnd();
        }
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
        await Engage(this, matchingElement, type, uow, observer, mountContext);
    }
    async getDerivedVal(uow, d, matchingElement) {
        const { getDerivedVal } = await import('./trHelpers/getDerivedVal.js');
        return await getDerivedVal(this, uow, d, matchingElement);
    }
    // async getNestedObjVal(uow: UnitOfWork<TProps, TMethods>, u: ObjectExpression<TProps, TMethods>){
    //     const {getNestedObjVal} = await import('./trHelpers/getNestedObjVal.js');
    //     return await getNestedObjVal(this, uow, u);
    // }
    getArrayVal(uow, u) {
        if (u.length === 1 && typeof u[0] === 'number')
            return u[0];
        const mapped = u.map(x => {
            switch (typeof x) {
                case 'number':
                    return this.getNumberUVal(uow, x);
                case 'string':
                    return x;
                default:
                    throw 'NI';
            }
        });
        return mapped.join('');
    }
    getNumberUVal(uow, d) {
        const { o } = uow;
        const propName = this.#getPropName(arr(o), d);
        const pOrC = o[d];
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
            // const keys = Object.keys(val);
            // if(keys[0] in matchingElement){
            Object.assign(matchingElement, val);
            return;
            // }else{
            //     (<any>matchingElement)[this.getDefaultProp(matchingElement)] = val;
            // }
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
        const match = transformer.calcCSS(queryInfo);
        const { options } = transformer;
        const { skipInit } = options;
        this.#mountObserver = new MountObserver({
            match,
            do: {
                onMount: async (matchingElement, observer, ctx) => {
                    if (this.queryInfo.propAttrType === '$') {
                        const { doNestedTransforms } = await import('./trHelpers/doNestedTransforms.js');
                        await doNestedTransforms(matchingElement, this.#unitsOfWork, this);
                        return;
                    }
                    for (const uow of this.#unitsOfWork) {
                        //this is where we could look to see if we need to do update if already updated by server
                        if (!skipInit || !ctx.initializing) {
                            await this.doUpdate(matchingElement, uow);
                        }
                        this.#matchingElements.push(new WeakRef(matchingElement));
                        await transformer.engage(matchingElement, 'onMount', uow, observer, ctx);
                        const { a, m } = uow;
                        if (a !== undefined) {
                            let transpiledActions;
                            if (typeof a === 'string') {
                                transpiledActions = [this.toStdEvt(a, matchingElement)];
                            }
                            else {
                                transpiledActions = arr(a).map(ai => typeof ai === 'string' ? this.toStdEvt(ai, matchingElement) : ai);
                            }
                            const { AddEventListener } = await import('./trHelpers/AddEventListener.js');
                            for (const ap of transpiledActions) {
                                const { on, do: action, options } = ap;
                                new AddEventListener(this.#mountObserver, transformer, uow, matchingElement, on, action);
                            }
                        }
                        if (m !== undefined) {
                            const transpiledMs = arr(m);
                            const { Mod } = await import('./trHelpers/Mod.js');
                            for (const mi of transpiledMs) {
                                new Mod(this.#mountObserver, transformer, matchingElement, mi);
                            }
                        }
                    }
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
        //this.#subscribe();
    }
    async subscribe() {
        for (const uow of this.#unitsOfWork) {
            const { o } = uow;
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
                this.#mountObserver.observe(target);
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
