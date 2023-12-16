import { MountObserver } from 'mount-observer/MountObserver.js';
export class Transformer extends EventTarget {
    target;
    model;
    manifest;
    #piqueProcessors;
    constructor(target, model, manifest) {
        super();
        this.target = target;
        this.model = model;
        this.manifest = manifest;
        const { piques } = manifest;
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
    constructor(transformer, pique, queryInfo) {
        super();
        this.transformer = transformer;
        this.pique = pique;
        this.queryInfo = queryInfo;
        const { q } = pique;
        this.#mountObserver = new MountObserver({
            match: transformer.calcCSS(queryInfo),
            do: {
                onMount: async (matchingElement) => {
                    this.doUpdate(matchingElement);
                }
            }
        });
    }
    #attachedEvents = false;
    doUpdate(matchingElement) {
        const { e } = this.pique;
        if (e !== undefined && !this.#attachedEvents) {
            this.#attachedEvents = true;
        }
    }
}
