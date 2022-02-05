import { DTR } from '../DTR.js';
import { RenderContext, TemplMgmtBase } from '../types.js';
export {TemplMgmtProps, TemplMgmtActions} from '../types.js';

export const TemplMgmt = (superclass: {new(): TemplMgmtBase}) => class extends superclass{
    #repeatVisit = false;
    #isDeclarativeShadowDOM = false;
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
                    this.#isDeclarativeShadowDOM = true;                    
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

    async doTemplMount({transform, waitToInit, clonedTemplate, noshadow}: TemplMgmtBase){
        if(waitToInit) return;
        const transforms = Array.isArray(transform) ? transform : [transform];
        const fragment = clonedTemplate === undefined ? 
            noshadow ? this : this.shadowRoot!
            : clonedTemplate as DocumentFragment;
        for(const t of transforms){
            const ctx: RenderContext = {
                host: this,
                match: t,

            }
            const dtr = new DTR(ctx);
            if(!this.hasAttribute('defer-rendering')){
                await dtr.transform(fragment);
            }
            await dtr.subscribe();
        }
        this.removeAttribute('defer-rendering');
        this.clonedTemplate = undefined;
    }
}

export const beTransformed = {
    cloneTemplate: {
        ifAllOf: ['mainTemplate'],
        ifKeyIn: ['noshadow', 'waitToInit']
    },
    doTemplMount: {
        ifAllOf: ['clonedTemplate', 'transform'],
        ifKeyIn: ['waitToInit'],
        async: true,
    }
};