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
    #adopt({styles}: TemplMgmtBase, root: ShadowRoot){
        if(styles === undefined) return;
        let styleSheets: CSSStyleSheet[] | HTMLTemplateElement | undefined;
        if(typeof styles === 'string'){
            const isReally = (<any>this.constructor).isReally as string;
            if(!compiledStyleMap.has(isReally)){
                const strippedStyle = styles.replace('<style>', '').replace('</style>', '');
                if(modernBrowser){
                    const sheet = new CSSStyleSheet();
                    (<any>sheet).replaceSync(strippedStyle);
                    compiledStyleMap.set(isReally, [sheet]);
                }else{
                    const tm = document.createElement('template');
                    const st = document.createElement('style');
                    st.innerHTML = strippedStyle;
                    tm.content.appendChild(st);
                    compiledStyleMap.set(isReally, tm);
                }
            }
            styleSheets = compiledStyleMap.get(isReally);
        }else{
            styleSheets = styles;
        }
        if(styleSheets instanceof HTMLTemplateElement){
            root.appendChild(styleSheets.content.cloneNode(true));
        }else if(Array.isArray(styleSheets)){
            (<any>root).adoptedStyleSheets = [...(<any>root).adoptedStyleSheets, ...styleSheets];
        }
            
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
        const {hydratingTransform, transform, waitToInit, clonedTemplate, noshadow, transformPlugins, DTRCtor} = base;
        if(waitToInit) return;
        
        const fragment = clonedTemplate === undefined ? 
            noshadow ? this : this.shadowRoot!
            : clonedTemplate as DocumentFragment;
        if(hydratingTransform || transform){
            const {MainTransforms} = await import('./MainTransforms.js');
            await MainTransforms(this as any as TemplMgmtBaseMixin & HTMLElement, base, fragment as DocumentFragment);
        }
        if(hydratingTransform !== undefined){
            const {DTR} = await import('../DTR.js');
            const ctx: RenderContext = {
                host: this,
                match: hydratingTransform,
                plugins: transformPlugins,
            }
            const ctor = DTRCtor === undefined ? DTR : DTRCtor;
            const dtr = new ctor(ctx);
            await dtr.transform(fragment);
        }
        if(transform !== undefined){
            const transforms = Array.isArray(transform) ? transform : [transform];
            const {DTR} = await import('../DTR.js');
            for(const t of transforms){
                const ctx: RenderContext = {
                    host: this,
                    match: t,
                    plugins: transformPlugins,
                }
                const ctor = DTRCtor === undefined ? DTR : DTRCtor;
                const dtr = new ctor(ctx);
                if(!this.hasAttribute('defer-rendering')){
                    await dtr.transform(fragment);
                }
                await dtr.subscribe();
            }
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

    async doHomeInOn({homeInOn}: this){

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