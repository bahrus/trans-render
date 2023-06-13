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
    async #adopt(base, root) {
        if (base.styles === undefined)
            return;
        const { DoStyles } = await import('./DoStyles.js');
        new DoStyles(this, base, root, compiledStyleMap, modernBrowser);
    }
    async cloneTemplate({ shadowRootMode, shadowRoot, mainTemplate, mntCnt, hydratingTransform, transform }) {
        let root = this;
        if (shadowRootMode) {
            if (shadowRoot === null) {
                root = this.attachShadow({ mode: shadowRootMode });
                this.#needToAppendClone = true;
                await this.#adopt(this, root);
            }
            else {
                root = shadowRoot;
                if (!this.#repeatVisit) {
                    //assume the shadow root came from declarative shadow dom, so no need to clone template
                    await this.#adopt(this, root);
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
        const { groom } = await import('../cache');
        switch (typeof mainTemplate) {
            case 'string':
                //const isReally = (<any>this.constructor).isReally as string;
                let templ = compiledTemplateMap.get(mainTemplate);
                if (templ === undefined) {
                    templ = document.createElement('template');
                    templ.innerHTML = mainTemplate;
                    compiledTemplateMap.set(mainTemplate, templ);
                }
                groom(templ);
                this.clonedTemplate = templ.content.cloneNode(true);
                break;
            default:
                groom(mainTemplate);
                this.clonedTemplate = mainTemplate.content.cloneNode(true);
        }
        this.#repeatVisit = true;
    }
    async doTemplMount(base) {
        const { hydratingTransform, transform, mntCnt, clonedTemplate, shadowRootMode, DTRCtor, homeInOn } = base;
        const fragment = clonedTemplate === undefined ?
            !shadowRootMode ? this : this.shadowRoot
            : clonedTemplate;
        const { restore } = await import('../cache');
        await restore(fragment);
        if (hydratingTransform || transform) {
            const { MainTransforms } = await import('./MainTransforms.js');
            await MainTransforms(this, base, fragment);
        }
        if (homeInOn) {
            const { HomeIn } = await import('./HomeIn.js');
        }
        if (this.#needToAppendClone) {
            const root = !shadowRootMode ? this : this.shadowRoot;
            root.appendChild(fragment);
            this.#needToAppendClone = false;
        }
        this.removeAttribute('defer-rendering');
        const states = base._internals_?.states;
        if (states !== undefined) { //Safari <= 16.4
            states.add('--mounted');
        }
        this.clonedTemplate = undefined;
    }
    initUnsafeTCnt({}) {
        this.unsafeTCount = 0;
    }
    async doComplexTR({ unsafeTransform, shadowRoot }) {
        const ctx = {
            host: this,
            match: unsafeTransform,
        };
        const fragment = shadowRoot || this;
        const { TR } = await import('../TR.js');
        TR.transform(fragment, ctx);
    }
};
export const beCloned = {
    cloneTemplate: {
        ifAllOf: ['mainTemplate'],
        ifKeyIn: ['shadowRootMode', 'waitToInit']
    },
};
export const beMounted = {
    doTemplMount: {
        ifAllOf: ['clonedTemplate'],
        ifNoneOf: ['mntCnt'],
        ifKeyIn: ['transform'],
        async: true,
    },
};
export const beTransformed = {
    initUnsafeTCnt: 'unsafeTransform',
    doComplexTR: 'unsafeTCount',
    ...beCloned,
    ...beMounted
};
