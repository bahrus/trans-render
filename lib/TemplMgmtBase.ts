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
        
        self.clonedTemplate = self.mainTemplate!.content.cloneNode(true);
        
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


export const doInitTransform: Partial<{[key in keyof TemplMgmtActions]: Action<TemplMgmtProps>}> = {
    cloneTemplate: {
        actIfKeyIn: ['mainTemplate', 'noshadow']
    },
    doInitTransform: {
        ifAllOf: ['clonedTemplate'],
    }
}

export interface TemplMgmtProps{
    mainTemplate?: HTMLTemplateElement;
    clonedTemplate?: Node | undefined;
    initTransform?: any;
    updateTransform?: any;
    noshadow?: boolean;
    renderOptions?: RenderOptions;
}

export interface TemplMgmtActions{
    doUpdateTransform(self: this): void;
    doInitTransform(self: this): void;
    cloneTemplate(self: this): void;
}

export interface TemplMgmtBase extends HTMLElement, TemplMgmtProps, TemplMgmtActions{}
