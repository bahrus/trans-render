import { transform } from './transform.js';
export { transform } from './transform.js';
export const TemplMgmtBaseMixin = (superclass) => class extends superclass {
    cloneTemplate(self) {
        if (self.shadowRoot === null && !self.noshadow) {
            self.attachShadow({ mode: 'open' });
        }
        self.clonedTemplate = self.mainTemplate.content.cloneNode(true);
    }
    loadPlugins(self) { }
    doInitTransform(self) {
        this.loadPlugins(self);
        transform(self.clonedTemplate, this.__ctx);
        const root = self.noshadow ? self : self.shadowRoot;
        root.appendChild(self.clonedTemplate);
        delete self.clonedTemplate;
    }
    doUpdateTransform(self) {
        this.__ctx.match = self.updateTransform;
        const root = self.noshadow ? self : self.shadowRoot;
        transform(root, this.__ctx);
    }
};

export const doInitTransform = {
    cloneTemplate: {
        ifAnyOf: ['mainTemplate', 'noshadow']
    },
    doInitTransform: {
        ifAnyOf: ['clonedTemplate', 'initTransform'],
        andAllOf: ['clonedTemplate', 'initTransform']
    }
};
