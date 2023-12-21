import { MountObserver } from 'mount-observer/MountObserver.js';
export function Transform(target, model, xform, propagator) {
    return new Transformer(target, model, xform, propagator);
}
export class Transformer extends EventTarget {
    target;
    model;
    piqueMap;
    propagator;
    #piqueProcessors;
    #piques = [];
    constructor(target, model, 
    //public piqueMap: Partial<{[key in PropQueryExpression]: PiqueWOQ<TProps, TActions>}>,
    piqueMap, propagator) {
        super();
        this.target = target;
        this.model = model;
        this.piqueMap = piqueMap;
        this.propagator = propagator;
        let prevKey;
        for (const key in piqueMap) {
            const newKey = key[0] === '^' ? prevKey : key;
            prevKey = newKey;
            const rhs = (piqueMap)[newKey];
            switch (typeof rhs) {
                case 'number': {
                    if (rhs !== 0)
                        throw 'NI';
                    const qi = this.calcQI(newKey);
                    const { prop } = qi;
                    const pique = {
                        o: [prop],
                        d: 0,
                        qi,
                        q: newKey
                    };
                    this.#piques.push(pique);
                    break;
                }
                case 'string':
                    {
                        const pique = {
                            o: [rhs],
                            d: 0,
                            q: newKey
                        };
                        this.#piques.push(pique);
                    }
                    break;
                case 'object':
                    {
                        const pique = {
                            d: 0,
                            ...rhs,
                            q: newKey
                        };
                        this.#piques.push(pique);
                    }
                    break;
            }
        }
        this.#piqueProcessors = [];
        for (const pique of this.#piques) {
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
    async doUpdate(matchingElement, piqueProcessor, u) {
        const { doUpdate } = await import('./aeiou/doUpdate.js');
        await doUpdate(this, matchingElement, piqueProcessor, u);
    }
    async doIfs(matchingElement, piqueProcessor, i) {
        const { doIfs } = await import('./aeiou/doIfs.js');
        await doIfs(this, matchingElement, piqueProcessor, i);
    }
    async doEnhance(matchingElement, type, piqueProcessor, mountContext, stage) {
        const { doEnhance } = await import('./aeiou/doEnhance.js');
        await doEnhance(this, matchingElement, type, piqueProcessor, mountContext, stage);
    }
    async getNestedObjVal(piqueProcessor, u) {
        const { getNestedObjVal } = await import('./aeiou/getNestedObjVal.js');
        return await getNestedObjVal(this, piqueProcessor, u);
    }
    getArrayVal(piqueProcessor, u) {
        if (u.length === 1 && typeof u[0] === 'number')
            return u[0];
        const mapped = u.map(x => {
            switch (typeof x) {
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
    getNumberUVal(piqueProcessor, d) {
        const { pique } = piqueProcessor;
        const { o } = pique;
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
}
export function arr(inp) {
    return inp === undefined ? []
        : Array.isArray(inp) ? inp : [inp];
}
export class MountOrchestrator extends EventTarget {
    transformer;
    pique;
    queryInfo;
    #mountObserver;
    #matchingElements = [];
    constructor(transformer, pique, queryInfo) {
        super();
        this.transformer = transformer;
        this.pique = pique;
        this.queryInfo = queryInfo;
        const { o: p } = pique;
        const match = transformer.calcCSS(queryInfo);
        this.#mountObserver = new MountObserver({
            match,
            do: {
                onMount: async (matchingElement, ctx, stage) => {
                    await this.doUpdate(matchingElement);
                    this.#matchingElements.push(new WeakRef(matchingElement));
                    await transformer.doEnhance(matchingElement, 'onMount', this, ctx, stage);
                },
                onDismount: async (matchingElement, ctx, stage) => {
                    this.#cleanUp(matchingElement);
                    await transformer.doEnhance(matchingElement, 'onDismount', this, ctx, stage);
                    //TODO remove weak ref from matching eleents;
                },
                onDisconnect: async (matchingElement, ctx, stage) => {
                    this.#cleanUp(matchingElement);
                    await transformer.doEnhance(matchingElement, 'onDisconnect', this, ctx, stage);
                }
            }
        });
        const { target, propagator } = transformer;
        if (propagator !== undefined) {
            for (const propName of p) {
                propagator.addEventListener(propName, e => {
                    const all = this.#cleanUp();
                    for (const matchingElement of all) {
                        this.doUpdate(matchingElement);
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
    async doUpdate(matchingElement) {
        const { d, i } = this.pique;
        if (d !== undefined) {
            await this.transformer.doUpdate(matchingElement, this, d);
        }
        if (i !== undefined) {
            await this.transformer.doIfs(matchingElement, this, i);
        }
    }
}
