export class ForEachImpl {
    subModel;
    #ref;
    #config;
    #templ;
    constructor(matchingElement, subModel, uows, mo) {
        this.subModel = subModel;
        this.#ref = new WeakRef(matchingElement);
        const [first] = uows;
        this.#config = first.f;
    }
    async init() {
        const config = this.#config;
        const { clone, xform, appendTo, indexProp } = config;
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
        const templ = this.#templ;
        const instances = [];
        const { subModel } = this;
        const { Transform } = await import('../Transform.js');
        let cnt = 1;
        for (const item of subModel) {
            const instance = templ.content.cloneNode(true);
            for (const child of instance.children) {
                child[indexProp] = cnt;
            }
            instances.push(instance);
            await Transform(instance, item, xform);
            cnt++;
        }
        const elToAppendTo = matchingElement.querySelector(appendTo);
        for (const instance of instances) {
            elToAppendTo?.appendChild(instance);
        }
    }
    async update() { }
}
