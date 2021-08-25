import { transform } from './transform.js';
export { transform } from './transform.js';
export const TemplMgmtBaseMixin = (superclass) => class extends superclass {
    __ctx;
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
// export const  doInitTransform : Action<TemplMgmtBase>[] = [
//     {
//         upon: ['mainTemplate', 'noshadow'],
//         do: 'cloneTemplate'
//     },
//     {
//         upon: ['clonedTemplate', 'initTransform'],
//         riff: ['clonedTemplate', 'initTransform'],
//         do: 'doInitTransform'
//     }
// ];
export const doInitTransform = {
    cloneTemplate: {
        actIfKeyIn: ['mainTemplate', 'noshadow']
    },
    doInitTransform: {
        ifAllOf: ['clonedTemplate', 'initTransform'],
    }
};
