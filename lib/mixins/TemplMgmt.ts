//import { DTR } from '../DTR.js';
import { RenderContext, TemplMgmtBase, TemplMgmtProps, Action } from '../types.js';
export {TemplMgmtProps, TemplMgmtActions, Action} from '../types.js';

export type TemplMgmtBaseMixin = {new(): TemplMgmtBase};

const compiledTemplateMap = new Map<string, HTMLTemplateElement>();
const compiledStyleMap = new Map<string, CSSStyleSheet[] | HTMLTemplateElement>();
let modernBrowser = false;
try{
    const sheet = new CSSStyleSheet();
    modernBrowser = ((<any>sheet).replaceSync !== undefined);
}catch{}
export const TemplMgmt = (superclass: TemplMgmtBaseMixin) => class extends superclass{
    #repeatVisit = false;
    #isDeclarativeShadowDOM = false;
    #needToAppendClone = false;
    async #adopt(base: TemplMgmtBase, root: ShadowRoot){
        if(base.styles === undefined) return;
        const {DoStyles} = await import('./DoStyles.js');
        new DoStyles(this, base, root, compiledStyleMap, modernBrowser);
            
    }
    async cloneTemplate({noshadow, shadowRoot, mainTemplate, styles, waitToInit}: TemplMgmtBase){
        if(waitToInit) return;
        let root = this as any;
        if(!noshadow){
            if(shadowRoot === null){
                root = this.attachShadow({mode: 'open'});
                this.#needToAppendClone = true;
                await this.#adopt(this, root);
               
            }else{
                root = shadowRoot;
                if(!this.#repeatVisit){
                    //assume the shadow root came from declarative shadow dom, so no need to clone template
                    await this.#adopt(this, root);
                    this.#isDeclarativeShadowDOM = true;                    
                    this.clonedTemplate = root;
                    this.#repeatVisit = true;
                    return;
                }                
            }
        }else{
            this.#needToAppendClone = true;
        }
        if(this.#repeatVisit){
            root.innerHTML = '';
            this.#needToAppendClone = true;
        }
        switch(typeof mainTemplate){
            case 'string':
                const isReally = (<any>this.constructor).isReally as string;
                if(!compiledTemplateMap.has(isReally)){
                    const templ = document.createElement('template');
                    templ.innerHTML = mainTemplate;
                    compiledTemplateMap.set(isReally, templ);
                }
                this.clonedTemplate = compiledTemplateMap.get(isReally)!.content.cloneNode(true);
                break;
            default:
                this.clonedTemplate = mainTemplate!.content.cloneNode(true);
        }
        
        this.#repeatVisit = true;
    }

    async doTemplMount(base: TemplMgmtBase){
        const {hydratingTransform, transform, waitToInit, clonedTemplate, noshadow, transformPlugins, DTRCtor, homeInOn} = base;
        if(waitToInit) return;
        
        const fragment = clonedTemplate === undefined ? 
            noshadow ? this : this.shadowRoot!
            : clonedTemplate as DocumentFragment;
        if(hydratingTransform || transform){
            const {MainTransforms} = await import('./MainTransforms.js');
            await MainTransforms(this as any as TemplMgmtBaseMixin & HTMLElement, base, fragment as DocumentFragment);
        }
        if(homeInOn){
            const {HomeIn} = await import('./HomeIn.js');
        }
        if(this.#needToAppendClone){
            const root = noshadow ? this : this.shadowRoot!;
            root.appendChild(fragment);
            this.#needToAppendClone = false;
        }
        this.removeAttribute('defer-rendering');
        this.clonedTemplate = undefined;
    }
    initUnsafeTCnt({}: this){
        this.unsafeTCount = 0;
    }
    async doComplexTR({unsafeTransform, shadowRoot}: this){
        const ctx: RenderContext = {
            host: this,
            match: unsafeTransform,
        }
        const fragment = shadowRoot || this;
        const {TR} = await import('../TR.js');
        TR.transform(fragment, ctx);
    }

}

export const beTransformed = {
    initUnsafeTCnt: 'unsafeTransform',
    doComplexTR: 'unsafeTCount',
    cloneTemplate: {
        ifAllOf: ['mainTemplate'],
        ifKeyIn: ['noshadow', 'waitToInit']
    } as Action<TemplMgmtProps>,
    doTemplMount: {
        ifAllOf: ['clonedTemplate'],
        ifKeyIn: ['waitToInit', 'transform'],
        async: true,
    } as Action<TemplMgmtProps>,
};