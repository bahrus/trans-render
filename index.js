import { MountObserver } from 'mount-observer/MountObserver.js';
export class Transformer extends EventTarget {
    target;
    model;
    manifest;
    propagator;
    #piqueProcessors;
    constructor(target, model, manifest, propagator) {
        super();
        this.target = target;
        this.model = model;
        this.manifest = manifest;
        this.propagator = propagator;
        let { piques, piqueMap } = manifest;
        if (piques === undefined) {
            if (piqueMap === undefined)
                throw 400;
            piques = [];
            for (const key in piqueMap) {
                const piqueWOQ = piqueMap[key];
                const pique = {
                    ...piqueWOQ,
                    q: key
                };
                piques.push(pique);
            }
        }
        this.#piqueProcessors = [];
        for (const pique of piques) {
            pique.p = arr(pique.p);
            const { p, q } = pique;
            const qi = this.calcQI(q, p);
            const newProcessor = new PiqueProcessor(this, pique, qi);
            this.#piqueProcessors.push(newProcessor);
        }
    }
    calcQI(pqe, p) {
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
            qi.prop = p[Number(second)];
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
        switch (typeof u) {
            case 'number': {
                const val = this.getNumberUVal(piqueProcessor, u);
                this.setPrimeValue(matchingElement, val);
                break;
            }
            case 'function': {
                const newU = await u(matchingElement, piqueProcessor);
                if (newU !== undefined) {
                    await this.doUpdate(matchingElement, piqueProcessor, newU);
                }
                break;
            }
            case 'object': {
                if (Array.isArray(u)) {
                    const val = this.getArrayVal(piqueProcessor, u);
                    this.setPrimeValue(matchingElement, val);
                }
                else {
                    const val = await this.getNestedObjVal(piqueProcessor, u);
                    Object.assign(matchingElement, val);
                }
            }
        }
    }
    async doEnhance(matchingElement, type, piqueProcessor, mountContext, stage) {
        const { pique } = piqueProcessor;
        const { e } = pique;
        if (e === undefined)
            return;
        const methodArg = {
            mountContext,
            stage,
            type
        };
        const model = this.model;
        switch (typeof e) {
            case 'string': {
                model[e](model, matchingElement, methodArg);
                break;
            }
            case 'object':
                const es = arr(e);
                for (const enhance of es) {
                    const { do: d, with: w } = enhance;
                    model[d](model, matchingElement, {
                        ...methodArg,
                        with: w
                    });
                }
                break;
        }
    }
    async getNestedObjVal(piqueProcessor, u) {
        const returnObj = {};
        for (const key in u) {
            const v = u[key];
            switch (typeof v) {
                case 'number': {
                    const val = this.getNumberUVal(piqueProcessor, v);
                    returnObj[key] = val;
                    break;
                }
                case 'function': {
                    throw 'NI';
                }
                case 'object': {
                    if (Array.isArray(v)) {
                        const val = this.getArrayVal(piqueProcessor, v);
                        returnObj[key] = val;
                    }
                    else {
                        const val = this.getNestedObjVal(piqueProcessor, v);
                        returnObj[key] = val;
                    }
                }
                case 'boolean':
                case 'string': {
                    returnObj[key] = v;
                    break;
                }
            }
        }
        return returnObj;
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
    getNumberUVal(piqueProcessor, u) {
        const { pique } = piqueProcessor;
        const { p } = pique;
        const propName = p[u];
        const val = this.model[propName];
        return val;
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
export class PiqueProcessor extends EventTarget {
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
        const { p } = pique;
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
    #attachedEvents = false;
    async doUpdate(matchingElement) {
        const { e, u } = this.pique;
        if (e !== undefined && !this.#attachedEvents) {
            this.#attachedEvents = true;
        }
        if (u !== undefined) {
            await this.transformer.doUpdate(matchingElement, this, u);
        }
    }
}
