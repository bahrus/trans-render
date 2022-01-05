import { transform } from '../transform.js';
import { getQuery} from '../specialKeys.js';
import { Action, PropInfo, RenderContext, RenderOptions, TemplMgmtActions, TemplMgmtBase, TemplMgmtProps } from '../types.js';
export { transform } from '../transform.js';
export {TemplMgmtActions, TemplMgmtProps, TemplMgmtBase} from '../types.js';

export const TemplMgmtBaseMixin = (superclass: {new(): TemplMgmtBase} )  => class extends superclass{
    __ctx: RenderContext | undefined;
    #repeatVisit = false;
    #isDSD = false;
    #compiledTemplate:HTMLTemplateElement | undefined;
    cloneTemplate({noshadow, shadowRoot, mainTemplate, styles, waitToInit}: TemplMgmtBase){
        if(waitToInit) return;
        let root = this as any;
        if(!noshadow){
            if(shadowRoot === null){
                root = this.attachShadow({mode: 'open'});
                if(styles !== undefined){
                    (<any>root).adoptedStyleSheets = styles;
                }
            }else{
                root = shadowRoot;
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
        switch(typeof mainTemplate){
            case 'string':
                if(this.#compiledTemplate === undefined){
                    const templ = document.createElement('template');
                    templ.innerHTML = mainTemplate;
                    this.#compiledTemplate = templ;
                }
                this.clonedTemplate = this.#compiledTemplate!.content.cloneNode(true);
                break;
            default:
                this.clonedTemplate = mainTemplate!.content.cloneNode(true);
        }
        
        this.#repeatVisit = true;
    }

    loadPlugins(self: this): void {}

    doInitTransform({clonedTemplate, noshadow}: this): void{
        if(this.waitToInit) return;
        this.loadPlugins(this); // this is where the initTransform is added to the ctx
        const propInfos = (this.constructor as any)['reactiveProps'] as {[key: string]: PropInfo};
        for(const refKey in propInfos){
            const propInfo = propInfos[refKey];
            if(propInfo.isRef){
                (<any>this)[refKey] = undefined;
            }
        }
        transform(clonedTemplate as DocumentFragment, this.__ctx!);
        this.doTemplMount(this, clonedTemplate as DocumentFragment);
        
        for(const refKey in propInfos){
            if((<any>this)[refKey] !== undefined) continue;
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
        if(this.hasAttribute('defer-rendering')){
            this.removeAttribute('defer-rendering');
            return;
        }
        this.__ctx!.match = self.updateTransform;
        const root = self.noshadow ? self : self.shadowRoot!;
        transform(root, this.__ctx!);
    }



}


export const doInitTransform: Partial<{[key in keyof TemplMgmtActions]: Action<TemplMgmtProps>}> = {
    cloneTemplate: {
        ifAllOf: ['mainTemplate'],
        ifKeyIn: ['noshadow', 'waitToInit']
    },
    doInitTransform: {
        ifAllOf: ['clonedTemplate'],
    }
}


