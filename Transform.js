import { MountObserver } from 'mount-observer/MountObserver.js';
export function Transform(target, model, xform, propagator) {
    return new Transformer(target, model, xform, propagator);
}
export class Transformer extends EventTarget {
    target;
    model;
    xform;
    propagator;
    #piqueProcessors;
    //#piques: Array<QuenitOfWork<TProps, TMethods>> = [];
    constructor(target, model, xform, propagator) {
        super();
        this.target = target;
        this.model = model;
        this.xform = xform;
        this.propagator = propagator;
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
        this.#piqueProcessors = [];
        for (const pique of uows) {
            let { q, qi } = pique;
            if (qi === undefined)
                qi = this.calcQI(q);
            const newProcessor = new MountOrchestrator(this, pique, qi);
            this.#piqueProcessors.push(newProcessor);
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
    async doUpdate(matchingElement, uow, d) {
        const { doUpdate } = await import('./trHelpers/doUpdate.js');
        await doUpdate(this, matchingElement, uow);
    }
    async doIfs(matchingElement, uow, i) {
        const { doIfs } = await import('./trHelpers/doIfs.js');
        return await doIfs(this, matchingElement, uow, i);
    }
    async doEnhance(matchingElement, type, uow, mountContext, stage) {
        const { e } = uow;
        if (e === undefined)
            return;
        const { Engage: doEnhance } = await import('./trHelpers/Engage.js');
        await doEnhance(this, matchingElement, type, uow, mountContext, stage);
    }
    async getDerivedVal(uow, d) {
        const { getDerivedVal } = await import('./trHelpers/getDerivedVal.js');
        return await getDerivedVal(this, uow, d);
    }
    async getNestedObjVal(uow, u) {
        const { getNestedObjVal } = await import('./trHelpers/getNestedObjVal.js');
        return await getNestedObjVal(this, uow, u);
    }
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
        matchingElement[this.getDefaultProp(matchingElement)] = val;
    }
    getDefaultProp(matchingElement) {
        if ('href' in matchingElement)
            return 'href';
        if ('value' in matchingElement && !('button-li'.includes(matchingElement.localName)))
            return 'value';
        return 'textContent';
    }
    s(p, val) {
        const { model, propagator } = this;
        model[p] = val;
        if (propagator !== undefined)
            propagator.dispatchEvent(new Event('p'));
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
        this.#mountObserver = new MountObserver({
            match,
            do: {
                onMount: async (matchingElement, ctx, stage) => {
                    for (const uow of this.#unitsOfWork) {
                        await this.doUpdate(matchingElement, uow);
                        this.#matchingElements.push(new WeakRef(matchingElement));
                        await transformer.doEnhance(matchingElement, 'onMount', uow, ctx, stage);
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
                        await transformer.doEnhance(matchingElement, 'onDismount', uow, ctx, stage);
                    }
                    //TODO remove weak ref from matching elements;
                },
                onDisconnect: async (matchingElement, ctx, stage) => {
                    for (const uow of this.#unitsOfWork) {
                        this.#cleanUp(matchingElement);
                        await transformer.doEnhance(matchingElement, 'onDisconnect', uow, ctx, stage);
                    }
                }
            }
        });
        for (const uow of this.#unitsOfWork) {
            const { o } = uow;
            const p = arr(o);
            const { target, propagator } = transformer;
            if (propagator !== undefined) {
                for (const propName of p) {
                    if (typeof propName !== 'string')
                        throw 'NI';
                    propagator.addEventListener(propName, e => {
                        const all = this.#cleanUp();
                        for (const matchingElement of all) {
                            this.doUpdate(matchingElement, uow);
                        }
                    });
                }
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
        const { d } = uow;
        // if(i !== undefined){
        //     await this.transformer.doIfs(matchingElement, uow, i);
        // }
        if (d !== undefined) {
            await this.transformer.doUpdate(matchingElement, uow, d);
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
