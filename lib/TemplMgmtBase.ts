import { transform } from './transform.js';
import { Action, RenderContext, RenderOptions } from './types.d.js';
export { transform } from './transform.js';

export const TemplMgmtBaseMixin = (superclass: {new(): TemplMgmtBase} )  => class extends superclass{
    __ctx: RenderContext | undefined;
    cloneTemplate(self: TemplMgmtBase){
        if(self.shadowRoot === null && !self.noshadow){
            self.attachShadow({mode: 'open'});
        }
        
        self.clonedTemplate = self.mainTemplate.content.cloneNode(true);
        
    }

    loadPlugins(self: TemplMgmtBase): void {}

    doInitTransform(self: TemplMgmtBase): void{
        this.loadPlugins(self);
        transform(self.clonedTemplate as DocumentFragment, this.__ctx!);
        const root = self.noshadow ? self : self.shadowRoot!;
        root.appendChild(self.clonedTemplate!);
        delete self.clonedTemplate;
    }

    doUpdateTransform(self: TemplMgmtBase){
        this.__ctx!.match = self.updateTransform;
        const root = self.noshadow ? self : self.shadowRoot!;
        transform(root, this.__ctx!);
    }


}


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

export const doInitTransform: Partial<{[key in keyof TemplMgmtBase]: Action<TemplMgmtBase>}> = {
    cloneTemplate: {
        upon: ['mainTemplate', 'noshadow']
    },
    doInitTransform: {
        upon: ['clonedTemplate', 'initTransform'],
        riff: '"'
    }
}

// export const doUpdateTransform: Partial<{[key in keyof TemplMgmtBase]: Action<TemplMgmtBase>}> = {
//     doUpdateTransform: {
//         upon: ['updateTransform']
//     }
// }

// export const doUpdateTransform: Action<TemplMgmtBase> = {
    
//     riff: ['updateTransform'],
//     do: 'doUpdateTransform',
// };

export interface TemplMgmtBase extends HTMLElement{
    doUpdateTransform(self: TemplMgmtBase): void;
    doInitTransform(self: TemplMgmtBase): void;
    cloneTemplate(self: TemplMgmtBase): void;
    mainTemplate: HTMLTemplateElement;
    clonedTemplate: Node | undefined;
    initTransform: any;
    updateTransform: any;
    noshadow: boolean;
    renderOptions: RenderOptions;
}