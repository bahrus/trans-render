export const forEachImpls = new WeakMap();
export const updateInProgress = new WeakSet();
export const doItAgain = new WeakSet();
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
        const { clone, wi } = config;
        const matchingElement = this.#ref.deref();
        if (matchingElement === undefined)
            return;
        const cssQry = clone || 'template';
        let elToClone = null;
        //let rootNode = matchingElement;
        if (wi !== undefined) {
            switch (wi) {
                case 'rootNode':
                    elToClone = matchingElement.getRootNode().querySelector(cssQry);
                    break;
                case 'upShadowSearch':
                    elToClone = (await import('../lib/upShadowSearch.js')).upShadowSearch(matchingElement, cssQry);
                    break;
                default:
                    elToClone = matchingElement.querySelector(cssQry);
            }
        }
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
        if (updateInProgress.has(matchingElement)) {
            doItAgain.add(matchingElement);
            return;
        }
        updateInProgress.add(matchingElement);
        const { xform, appendTo, indexProp, timestampProp, outOfRangeAction, outOfRangeProp } = config;
        const instances = [];
        //const transformerLookup = new Map<Node, Transformer<any>>();
        const { Transform } = await import('../Transform.js');
        let cnt = 1;
        for (const item of subModel) {
            const ithTransformer = this.#transforms.get(cnt - 1);
            if (ithTransformer !== undefined) {
                //already generated initial item, so update the bindings
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
            //need to create the item for the first time.
            const { getBlowDriedTempl } = await import('../lib/getBlowDriedTempl.js');
            const blowDriedTempl = getBlowDriedTempl(templ);
            const instance = blowDriedTempl.content.cloneNode(true);
            const transformers = [];
            for (const child of instance.children) {
                child[indexProp] = cnt;
                const transformer = await Transform(child, item, xform);
                transformers.push(transformer);
            }
            const ithTransformer2 = {
                transformers,
                item,
            };
            this.#transforms.set(cnt - 1, ithTransformer2);
            instances.push(instance);
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
        updateInProgress.delete(matchingElement);
        // if(doItAgain.has(matchingElement)){
        //     doItAgain.delete(matchingElement);
        //     this.update(subModel);
        // }
    }
}
