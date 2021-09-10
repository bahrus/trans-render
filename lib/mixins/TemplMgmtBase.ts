import { transform } from '../transform.js';
import { getQuery} from '../specialKeys.js';
import { Action, PropInfo, RenderContext, RenderOptions } from '../types.js';
export { transform } from '../transform.js';

export const TemplMgmtBaseMixin = (superclass: {new(): TemplMgmtBase} )  => class extends superclass{
    __ctx: RenderContext | undefined;
    #repeatVisit = false;
    #isDSD = false;
    cloneTemplate({noshadow, shadowRoot, mainTemplate, styles}: TemplMgmtBase){
        let root = this as any;
        if(!noshadow){
            if(shadowRoot === null){
                root = this.attachShadow({mode: 'open'});
                if(styles !== undefined){
                    (<any>root).adoptedStyleSheets = styles;
                }
            }else{
                root = this.shadowRoot;
                if(!this.#repeatVisit){
                    //assume the shadow root came from declarative shadow dom, so no need to clone template
                    if(styles !== undefined){
                        //controversial!
                        (<any>root).adoptedStyleSheets = styles;
                    }
                    this.#isDSD = true;                    
                    this.clonedTemplate = root;
                    this.#repeatVisit = true;
                    return;
                } 
            }

        }
        if(this.#repeatVisit){
            root.innerHTML = '';
        }
        this.clonedTemplate = mainTemplate!.content.cloneNode(true);
        this.#repeatVisit = true;
    }

    loadPlugins(self: this): void {}

    doInitTransform({clonedTemplate, noshadow}: this): void{
        this.loadPlugins(this);
        transform(clonedTemplate as DocumentFragment, this.__ctx!);
        this.doTemplMount(this, clonedTemplate as DocumentFragment);
        const propInfos = (this.constructor as any)['reactiveProps'] as {[key: string]: PropInfo};
        for(const refKey in propInfos){
            const propInfo = propInfos[refKey];
            if(propInfo.isRef){
                const queryInfo = getQuery(refKey);
                (<any>this)[refKey] = (clonedTemplate as DocumentFragment).querySelectorAll(queryInfo.query); 
            }

        }
        const root = noshadow ? this : this.shadowRoot!;
        if(!this.#isDSD){
            root.appendChild(clonedTemplate!);
        }else{
            this.#isDSD = false;
        }
        this.clonedTemplate = undefined;
    }

    doTemplMount(self: this, clonedTemplate: DocumentFragment){}

    doUpdateTransform(self: this){
        this.__ctx!.match = self.updateTransform;
        const root = self.noshadow ? self : self.shadowRoot!;
        transform(root, this.__ctx!);
    }



}


export const doInitTransform: Partial<{[key in keyof TemplMgmtActions]: Action<TemplMgmtProps>}> = {
    cloneTemplate: {
        ifKeyIn: ['mainTemplate', 'noshadow']
    },
    doInitTransform: {
        ifAllOf: ['clonedTemplate'],
    }
}

export interface TemplMgmtProps{
    mainTemplate?: HTMLTemplateElement;
    styles?: CSSStyleSheet[];
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
