import { transform } from '../transform.js';
import { getQuery } from '../specialKeys.js';
export { transform } from '../transform.js';
export const TemplMgmtBaseMixin = (superclass) => class extends superclass {
    __ctx;
    #repeatVisit = false;
    #isDSD = false;
    cloneTemplate({ noshadow, shadowRoot, mainTemplate, styles }) {
        let root = this;
        if (!noshadow) {
            if (shadowRoot === null) {
                root = this.attachShadow({ mode: 'open' });
                if (styles !== undefined) {
                    root.adoptedStyleSheets = styles;
                }
            }
            else {
                root = this.shadowRoot;
                if (!this.#repeatVisit) {
                    //assume the shadow root came from declarative shadow dom, so no need to clone template
                    if (styles !== undefined) {
                        //controversial!
                        root.adoptedStyleSheets = styles;
                    }
                    this.#isDSD = true;
                    this.clonedTemplate = root;
                    this.#repeatVisit = true;
                    return;
                }
            }
        }
        if (this.#repeatVisit) {
            root.innerHTML = '';
        }
        this.clonedTemplate = mainTemplate.content.cloneNode(true);
        this.#repeatVisit = true;
    }
    loadPlugins(self) { }
    doInitTransform({ clonedTemplate, noshadow }) {
        if (this.waitToInit)
            return;
        this.loadPlugins(this);
        const propInfos = this.constructor['reactiveProps'];
        for (const refKey in propInfos) {
            const propInfo = propInfos[refKey];
            if (propInfo.isRef) {
                this[refKey] = undefined;
            }
        }
        transform(clonedTemplate, this.__ctx);
        this.doTemplMount(this, clonedTemplate);
        for (const refKey in propInfos) {
            if (this[refKey] !== undefined)
                continue;
            const propInfo = propInfos[refKey];
            if (propInfo.isRef) {
                const queryInfo = getQuery(refKey);
                this[refKey] = clonedTemplate.querySelectorAll(queryInfo.query);
            }
        }
        const root = noshadow ? this : this.shadowRoot;
        if (!this.#isDSD) {
            root.appendChild(clonedTemplate);
        }
        else {
            this.#isDSD = false;
        }
        this.clonedTemplate = undefined;
    }
    doTemplMount(self, clonedTemplate) { }
    doUpdateTransform(self) {
        this.__ctx.match = self.updateTransform;
        const root = self.noshadow ? self : self.shadowRoot;
        transform(root, this.__ctx);
    }
};
export const doInitTransform = {
    cloneTemplate: {
        ifAllOf: ['mainTemplate'],
        ifKeyIn: ['noshadow', 'waitToInit']
    },
    doInitTransform: {
        ifAllOf: ['clonedTemplate'],
    }
};
