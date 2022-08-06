const compiledTemplateMap = new Map();
const compiledStyleMap = new Map();
let modernBrowser = false;
try {
    const sheet = new CSSStyleSheet();
    modernBrowser = (sheet.replaceSync !== undefined);
}
catch { }
export const TemplMgmt = (superclass) => class extends superclass {
    #repeatVisit = false;
    #isDeclarativeShadowDOM = false;
    #needToAppendClone = false;
    #adopt({ styles }, root) {
        if (styles === undefined)
            return;
        let styleSheets;
        if (typeof styles === 'string') {
            const isReally = this.constructor.isReally;
            if (!compiledStyleMap.has(isReally)) {
                const strippedStyle = styles.replace('<style>', '').replace('</style>', '');
                if (modernBrowser) {
                    const sheet = new CSSStyleSheet();
                    sheet.replaceSync(strippedStyle);
                    compiledStyleMap.set(isReally, [sheet]);
                }
                else {
                    const tm = document.createElement('template');
                    const st = document.createElement('style');
                    st.innerHTML = strippedStyle;
                    tm.content.appendChild(st);
                    compiledStyleMap.set(isReally, tm);
                }
            }
            styleSheets = compiledStyleMap.get(isReally);
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
                const isReally = this.constructor.isReally;
                if (!compiledTemplateMap.has(isReally)) {
                    const templ = document.createElement('template');
                    templ.innerHTML = mainTemplate;
                    compiledTemplateMap.set(isReally, templ);
                }
                this.clonedTemplate = compiledTemplateMap.get(isReally).content.cloneNode(true);
                break;
            default:
                this.clonedTemplate = mainTemplate.content.cloneNode(true);
        }
        this.#repeatVisit = true;
    }
    async doTemplMount({ hydratingTransform, transform, waitToInit, clonedTemplate, noshadow, transformPlugins, DTRCtor }) {
        if (waitToInit)
            return;
        const fragment = clonedTemplate === undefined ?
            noshadow ? this : this.shadowRoot
            : clonedTemplate;
        if (hydratingTransform !== undefined) {
            const { DTR } = await import('../DTR.js');
            const ctx = {
                host: this,
                match: hydratingTransform,
                plugins: transformPlugins,
            };
            const ctor = DTRCtor === undefined ? DTR : DTRCtor;
            const dtr = new ctor(ctx);
            await dtr.transform(fragment);
        }
        if (transform !== undefined) {
            const transforms = Array.isArray(transform) ? transform : [transform];
            const { DTR } = await import('../DTR.js');
            for (const t of transforms) {
                const ctx = {
                    host: this,
                    match: t,
                    plugins: transformPlugins,
                };
                const ctor = DTRCtor === undefined ? DTR : DTRCtor;
                const dtr = new ctor(ctx);
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
