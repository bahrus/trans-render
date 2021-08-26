import { transform } from './transform.js';
import { getQuery} from './specialKeys.js';
import { Action, PropInfo, RenderContext, RenderOptions } from './types.d.js';
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
        const {clonedTemplate} = self;
        this.loadPlugins(self);
        transform(clonedTemplate as DocumentFragment, this.__ctx!);
        const propInfos = (self.constructor as any)['reactiveProps'] as {[key: string]: PropInfo};
        for(const refKey in propInfos){
            const propInfo = propInfos[refKey];
            if(propInfo.isRef){
                const queryInfo = getQuery(refKey);
                (<any>self)[refKey] = (clonedTemplate as DocumentFragment).querySelectorAll(queryInfo.query); 
            }

        }
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
        actIfKeyIn: ['mainTemplate', 'noshadow']
    },
    doInitTransform: {
        ifAllOf: ['clonedTemplate', 'initTransform'],
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