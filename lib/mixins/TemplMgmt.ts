//import { DTR } from '../DTR.js';
import { RenderContext, TemplMgmtBase, TemplMgmtProps, Action, Matches } from '../types.js';
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
    async cloneTemplate({shadowRootMode, shadowRoot, mainTemplate, mntCnt, hydratingTransform, transform}: TemplMgmtBase){
        let root = this as any;
        if(shadowRootMode){
            if(shadowRoot === null){
                root = this.attachShadow({mode: shadowRootMode});
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
        const {cache} = await import('../cache.js');
        switch(typeof mainTemplate){
            case 'string':
                //const isReally = (<any>this.constructor).isReally as string;
                let templ: HTMLTemplateElement | undefined = compiledTemplateMap.get(mainTemplate)!
                if(templ === undefined){
                    templ = document.createElement('template');
                    templ.innerHTML = mainTemplate;
                    compiledTemplateMap.set(mainTemplate, templ);
                }
                cache(templ);
                this.clonedTemplate = templ.content.cloneNode(true);
                break;
            default:
                cache(mainTemplate!);
                this.clonedTemplate = mainTemplate!.content.cloneNode(true);
        }
        
        this.#repeatVisit = true;
    }

    async doTemplMount(base: TemplMgmtBase){
        const {hydratingTransform, transform, mntCnt, clonedTemplate, shadowRootMode, DTRCtor, homeInOn} = base;
        const fragment = clonedTemplate === undefined ? 
            !shadowRootMode ? this : this.shadowRoot!
            : clonedTemplate as DocumentFragment;
        const {restore} = await import('../cache.js');
        (<any>fragment).host = this;
        await restore(fragment as DocumentFragment);
        if(hydratingTransform || transform){
            const {MainTransforms} = await import('./MainTransforms.js');
            await MainTransforms(this as any as TemplMgmtBaseMixin & HTMLElement, base, fragment as DocumentFragment);
        }
        if(homeInOn){
            const {HomeIn} = await import('./HomeIn.js');
        }
        if(this.#needToAppendClone){
            const root = !shadowRootMode ? this : this.shadowRoot!;
            root.appendChild(fragment);
            this.#needToAppendClone = false;
        }
        this.removeAttribute('defer-rendering');
        const states = (<any>base)._internals_?.states;
        if(states !== undefined){ //Safari <= 16.4
            states.add('--mounted');
        }
        
        this.clonedTemplate = undefined;
    }
    initUnsafeTCnt({}: this){
        this.unsafeTCount = 0;
    }
    async doComplexTR({unsafeTransform, shadowRoot}: this){
        const ctx: RenderContext = {
            host: this,
            match: unsafeTransform as any as Matches,
        }
        const fragment = shadowRoot || this;
        const {TR} = await import('../TR.js');
        TR.transform(fragment, ctx);
    }

}

export const beCloned = {
    cloneTemplate: {
        ifAllOf: ['mainTemplate'],
        ifKeyIn: ['shadowRootMode', 'waitToInit'],
        ifNoneOf: ['skipTemplateClone']
    } as Action<TemplMgmtProps>,
}

export const beMounted = {
    doTemplMount: {
        ifAllOf: ['clonedTemplate'],
        ifNoneOf: ['mntCnt'],
        ifKeyIn: ['transform'],
        async: true,
    } as Action<TemplMgmtProps>,
}

export const beTransformed = {
    initUnsafeTCnt: 'unsafeTransform',
    doComplexTR: 'unsafeTCount',
    ...beCloned,
    ...beMounted
};
