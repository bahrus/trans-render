export const forEachImpls = new WeakMap();
export class ForEachImpl {
    #ref;
    #config;
    #templ;
    #transforms = new Map();
    constructor(matchingElement, 
    //public subModel: any[],
    uows, mo) {
        this.#ref = new WeakRef(matchingElement);
        const [first] = uows;
        this.#config = first.f;
    }
    async init() {
        const config = this.#config;
        const { clone } = config;
        const matchingElement = this.#ref.deref();
        if (matchingElement === undefined)
            return;
        const elToClone = matchingElement.querySelector(clone || 'template');
        if (elToClone instanceof HTMLTemplateElement) {
            this.#templ = elToClone;
        }
        else {
            const templ = document.createElement('template');
            templ.innerHTML = elToClone?.outerHTML;
            this.#templ = templ;
        }
    }
    async update(subModel) {
        //console.log('update');
        const templ = this.#templ;
        const config = this.#config;
        const matchingElement = this.#ref.deref();
        if (matchingElement === undefined)
            throw 'NI';
        const { xform, appendTo, indexProp, timestampProp, outOfRangeAction, outOfRangeProp } = config;
        const instances = [];
        const transformerLookup = new Map();
        const { Transform } = await import('../Transform.js');
        let cnt = 1;
        for (const item of subModel) {
            const ithTransformer = this.#transforms.get(cnt - 1);
            if (ithTransformer !== undefined) {
                cnt++;
                const { item: i, timeStampVal } = ithTransformer;
                if (outOfRangeProp) {
                    const { isOutOfRange, transformers } = ithTransformer;
                    if (isOutOfRange) {
                        for (const transformer of transformers) {
                            const { target } = transformer;
                            target[outOfRangeProp] = false;
                        }
                    }
                }
                if (i === item) {
                    continue;
                }
                if (timestampProp !== undefined) {
                    if (timeStampVal === item[timestampProp]) {
                        continue;
                    }
                }
                const { transformers } = ithTransformer;
                for (const transformer of transformers) {
                    await transformer.updateModel(item);
                }
                continue;
            }
            const instance = templ.content.cloneNode(true);
            const transformers = [];
            for (const child of instance.children) {
                child[indexProp] = cnt;
                const transformer = await Transform(child, item, xform);
                transformers.push(transformer);
            }
            instances.push(instance);
            this.#transforms.set(cnt - 1, {
                item,
                transformers,
                timeStampVal: timestampProp !== undefined ? item[timestampProp] : undefined,
            });
            cnt++;
        }
        if (outOfRangeAction !== undefined || outOfRangeProp !== undefined) {
            let nextTransform = this.#transforms.get(cnt - 1);
            while (nextTransform) {
                nextTransform.isOutOfRange = true;
                const { transformers } = nextTransform;
                for (const transformer of transformers) {
                    const { target } = transformer;
                    //debugger;
                    if (outOfRangeAction !== undefined) {
                        const { getVal } = await import('../lib/getVal.js');
                        await getVal({ host: target }, outOfRangeAction);
                    }
                    if (outOfRangeProp) {
                        target[outOfRangeProp] = true;
                    }
                }
                cnt++;
                nextTransform = this.#transforms.get(cnt - 1);
            }
        }
        const elToAppendTo = appendTo !== undefined ? matchingElement.querySelector(appendTo) : matchingElement;
        for (const instance of instances) {
            elToAppendTo?.append(instance);
            //debugger;
        }
    }
}
