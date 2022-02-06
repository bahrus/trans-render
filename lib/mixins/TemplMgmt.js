import { DTR } from '../DTR.js';
export const TemplMgmt = (superclass) => class extends superclass {
    #repeatVisit = false;
    #isDeclarativeShadowDOM = false;
    #compiledTemplate;
    #needToAppendClone = false;
    cloneTemplate({ noshadow, shadowRoot, mainTemplate, styles, waitToInit }) {
        if (waitToInit)
            return;
        let root = this;
        if (!noshadow) {
            if (shadowRoot === null) {
                root = this.attachShadow({ mode: 'open' });
                this.#needToAppendClone = true;
                if (styles !== undefined) {
                    root.adoptedStyleSheets = styles;
                }
            }
            else {
                root = shadowRoot;
                if (!this.#repeatVisit) {
                    //assume the shadow root came from declarative shadow dom, so no need to clone template
                    if (styles !== undefined) {
                        //controversial!
                        root.adoptedStyleSheets = styles;
                    }
                    this.#isDeclarativeShadowDOM = true;
                    this.clonedTemplate = root;
                    this.#repeatVisit = true;
                    return;
                }
            }
        }
        else {
            this.#needToAppendClone = true;
        }
        if (this.#repeatVisit) {
            root.innerHTML = '';
            this.#needToAppendClone = true;
        }
        switch (typeof mainTemplate) {
            case 'string':
                if (this.#compiledTemplate === undefined) {
                    const templ = document.createElement('template');
                    templ.innerHTML = mainTemplate;
                    this.#compiledTemplate = templ;
                }
                this.clonedTemplate = this.#compiledTemplate.content.cloneNode(true);
                break;
            default:
                this.clonedTemplate = mainTemplate.content.cloneNode(true);
        }
        this.#repeatVisit = true;
    }
    async doTemplMount({ transform, waitToInit, clonedTemplate, noshadow, transformPlugins }) {
        if (waitToInit)
            return;
        const transforms = Array.isArray(transform) ? transform : [transform];
        const fragment = clonedTemplate === undefined ?
            noshadow ? this : this.shadowRoot
            : clonedTemplate;
        for (const t of transforms) {
            const ctx = {
                host: this,
                match: t,
                plugins: transformPlugins,
            };
            const dtr = new DTR(ctx);
            if (!this.hasAttribute('defer-rendering')) {
                await dtr.transform(fragment);
            }
            await dtr.subscribe();
        }
        if (this.#needToAppendClone) {
            const root = noshadow ? this : this.shadowRoot;
            root.appendChild(fragment);
            this.#needToAppendClone = false;
        }
        this.removeAttribute('defer-rendering');
        this.clonedTemplate = undefined;
    }
};
export const beTransformed = {
    cloneTemplate: {
        ifAllOf: ['mainTemplate'],
        ifKeyIn: ['noshadow', 'waitToInit']
    },
    doTemplMount: {
        ifAllOf: ['clonedTemplate', 'transform'],
        ifKeyIn: ['waitToInit'],
        async: true,
    },
};
