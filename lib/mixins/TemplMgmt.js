const compiledTemplateMap = new Map();
const compiledStyleMap = new Map();
export const TemplMgmt = (superclass) => class extends superclass {
    #repeatVisit = false;
    #isDeclarativeShadowDOM = false;
    #needToAppendClone = false;
    #adopt({ styles }, root) {
        if (styles === undefined)
            return;
        let styleSheets;
        if (typeof styles === 'string') {
            if (!compiledStyleMap.has(superclass)) {
                const sheet = new CSSStyleSheet();
                if (sheet.replaceSync === undefined) {
                    //SafariFox
                    const tm = document.createElement('template');
                    tm.innerHTML = styles;
                    compiledStyleMap.set(superclass, tm);
                }
                else {
                    sheet.replaceSync(styles.replace('<style>', '').replace('</style>', '')); //Safari and Firefox do not support replaceSync
                    compiledStyleMap.set(superclass, [sheet]);
                }
            }
            styleSheets = compiledStyleMap.get(superclass);
        }
        else {
            styleSheets = styles;
        }
        if (styleSheets instanceof HTMLTemplateElement) {
            root.appendChild(styleSheets.content.cloneNode(true));
        }
        else if (Array.isArray(styleSheets)) {
            root.adoptedStyleSheets = [...root.adoptedStyleSheets, ...styleSheets];
        }
    }
    async cloneTemplate({ noshadow, shadowRoot, mainTemplate, styles, waitToInit }) {
        if (waitToInit)
            return;
        let root = this;
        if (!noshadow) {
            if (shadowRoot === null) {
                root = this.attachShadow({ mode: 'open' });
                this.#needToAppendClone = true;
                this.#adopt(this, root);
            }
            else {
                root = shadowRoot;
                if (!this.#repeatVisit) {
                    //assume the shadow root came from declarative shadow dom, so no need to clone template
                    this.#adopt(this, root);
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
                if (!compiledTemplateMap.has(superclass)) {
                    const templ = document.createElement('template');
                    templ.innerHTML = mainTemplate;
                    compiledTemplateMap.set(superclass, templ);
                }
                this.clonedTemplate = compiledTemplateMap.get(superclass).content.cloneNode(true);
                break;
            default:
                this.clonedTemplate = mainTemplate.content.cloneNode(true);
        }
        this.#repeatVisit = true;
    }
    async doTemplMount({ transform, waitToInit, clonedTemplate, noshadow, transformPlugins }) {
        if (waitToInit)
            return;
        const fragment = clonedTemplate === undefined ?
            noshadow ? this : this.shadowRoot
            : clonedTemplate;
        if (transform !== undefined) {
            const transforms = Array.isArray(transform) ? transform : [transform];
            const { DTR } = await import('../DTR.js');
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
        ifAllOf: ['clonedTemplate'],
        ifKeyIn: ['waitToInit', 'transform'],
        async: true,
    },
};
