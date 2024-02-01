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
        const elToClone = matchingElement.querySelector(clone);
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
        console.log('update');
        const templ = this.#templ;
        const config = this.#config;
        const matchingElement = this.#ref.deref();
        if (matchingElement === undefined)
            throw 'NI';
        const { xform, appendTo, indexProp, timestampProp } = config;
        const instances = [];
        const { Transform } = await import('../Transform.js');
        let cnt = 1;
        for (const item of subModel) {
            const ithTransformer = this.#transforms.get(cnt - 1);
            if (ithTransformer !== undefined) {
                cnt++;
                const { item: i, timeStampVal } = ithTransformer;
                if (i === item) {
                    continue;
                }
                if (timestampProp !== undefined) {
                    if (timeStampVal === item[timestampProp]) {
                        continue;
                    }
                }
                const { transformer } = ithTransformer;
                await transformer.updateModel(item);
                continue;
            }
            const instance = templ.content.cloneNode(true);
            for (const child of instance.children) {
                child[indexProp] = cnt;
            }
            instances.push(instance);
            const transformer = await Transform(instance, item, xform);
            this.#transforms.set(cnt - 1, {
                item,
                transformer,
                timeStampVal: timestampProp !== undefined ? item[timestampProp] : undefined,
            });
            cnt++;
        }
        const elToAppendTo = matchingElement.querySelector(appendTo);
        for (const instance of instances) {
            elToAppendTo?.appendChild(instance);
        }
    }
}
