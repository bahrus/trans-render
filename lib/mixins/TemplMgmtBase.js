import { transform } from '../transform.js';
import { getQuery } from '../specialKeys.js';
export { transform } from '../transform.js';
export const TemplMgmtBaseMixin = (superclass) => class extends superclass {
    cloneTemplate(self) {
        if (self.shadowRoot === null && !self.noshadow) {
            const root = self.attachShadow({ mode: 'open' });
            if (self.styles) {
                root.adoptedStyleSheets = self.styles;
            }
        }
        self.clonedTemplate = self.mainTemplate.content.cloneNode(true);
    }
    loadPlugins(self) { }
    doInitTransform({ clonedTemplate, noshadow }) {
        this.loadPlugins(this);
        transform(clonedTemplate, this.__ctx);
        this.doTemplMount(this, clonedTemplate);
        const propInfos = this.constructor['reactiveProps'];
        for (const refKey in propInfos) {
            const propInfo = propInfos[refKey];
            if (propInfo.isRef) {
                const queryInfo = getQuery(refKey);
                this[refKey] = clonedTemplate.querySelectorAll(queryInfo.query);
            }
        }
        const root = noshadow ? this : this.shadowRoot;
        root.appendChild(clonedTemplate);
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
        ifKeyIn: ['mainTemplate', 'noshadow']
    },
    doInitTransform: {
        ifAllOf: ['clonedTemplate'],
    }
};
