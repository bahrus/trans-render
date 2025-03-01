import {O, OConfig} from './froop/O.js';
import { MntCfg, MountActions, MountProps, PMP, ProPMP } from './ts-refs/trans-render/types.js'; 
export {MntCfg, MountProps, MountActions} from './ts-refs/trans-render/types.js';
import {MntCfgMxn} from './MntCfgMxn.js'; 


export class Mount<TProps extends {}, TActions = TProps, ETProps = TProps> 
        extends O<TProps, TActions> 
        implements MountActions<TProps, TActions, ETProps>{
    static mntCfgMxn: OConfig<MountProps, MountActions> = MntCfgMxn;

    #root: ShadowRoot | HTMLElement;
    #csr = false;
    get csr(){
        return (this.config.assumeCSR && !this.hasAttribute('no-csr')) || this.#csr || this.hasAttribute('csr');
    }
    get config(){
        return (<any>this.constructor).config as MntCfg;
    }
    // get mntConfig(){
    //     return (<any>this.constructor).mntCfgMxn as OConfig;
    // }
    get xform(){
        return this.config.xform;
    }
    get xxform(){
        return this.config.xxform;
    }
    constructor(){
        super();
        const {config} = this;
        const {shadowRootInit, styles} = config;
        if(shadowRootInit){
            if(this.shadowRoot === null){
                this.attachShadow(shadowRootInit);
                this.#csr = true;
            }else if(!styles){
                const declarativeStyles = Array.from(this.shadowRoot.querySelectorAll('style[adopt]'));
                config.styles = declarativeStyles.map(x => x.innerHTML);
            }
            this.#root = this.shadowRoot!;
            let stringStyles: Array<string> | undefined;
            if(typeof(styles) === 'string'){
                stringStyles = [styles];
            }else if(Array.isArray(styles) && styles.length > 0 && typeof(styles[0]) === 'string'){
                stringStyles = styles as Array<string>;
            }else if(typeof(styles) === undefined){
                stringStyles = [''];
            }
            if(stringStyles !== undefined){
                stringStyles = stringStyles.map(x => x.replace("<style>", "").replace("</style>", ""));
                stringStyles[0] += String.raw `
* {
    --attrs-to-reflect: initial;
}
                `;
                const CSSStyleSheets: CSSStyleSheet[] = [];
                for(const stringSyleSheet of stringStyles){
                    const newSheet = new CSSStyleSheet();
                    newSheet.replaceSync(stringSyleSheet);
                    CSSStyleSheets.push(newSheet);
                }
                config.styles = CSSStyleSheets;
            }



            if(this.#csr){
                let compiledStyles = config.styles as CSSStyleSheet[] | undefined;
                if(compiledStyles !== undefined){
                    this.shadowRoot!.adoptedStyleSheets = [...compiledStyles];
                    
                }
            }
            
        }else{
            this.#root = this;
        }

    }

    cloneMT(self: this): Partial<MountProps> {
        const {config} = this;
        let {mainTemplate, appendOnClone} = config;
        if(typeof mainTemplate === 'string'){
            const templ = document.createElement('template');
            templ.innerHTML = mainTemplate;
            config.mainTemplate = templ;
            mainTemplate = templ;
        }
        let clonedTemplate = mainTemplate.content.cloneNode(true);
        if(appendOnClone){
            this.#root.appendChild(clonedTemplate);
            clonedTemplate = this.#root;
        }
        return {
            clonedTemplate
        } as Partial<MountProps>
    }
    async initCSRXform(self: this): ProPMP<TProps, TActions, ETProps> {
        const {clonedTemplate, xform, propagator, xxform} = self;
        const {Transform} = await import('./Transform.js');
        if(xform !== undefined){
            await Transform<any, any>(clonedTemplate!, this, xform, {
                propagator,
                propagatorIsReady: true,
            });
        }
        if(xxform !== undefined){
            await Transform<any, any>(clonedTemplate!, this, xxform, {
                propagator,
                propagatorIsReady: true,
                useViewTransition: true,
            });
        }
        return {
            hydrated: true,
        }
    }
    mountClone(self: this): PMP<TProps, TActions, ETProps> {
        const {clonedTemplate, config} = self;
        const {appendOnClone} = config;
        if(!appendOnClone){
            this.#root.appendChild(clonedTemplate!);
        }
        return {

        }
    }
    async initSSRXform(self: this): ProPMP<TProps, TActions, ETProps> {
        const root = self.#root;
        const {xform, propagator, xxform} = self;
        const {Transform} = await import('./Transform.js');
        if(xform !== undefined){
            await Transform<any, any>(root, this, xform!, {
                propagator
            });
        }
        if(xxform !== undefined){
            await Transform<any, any>(root, this, xform!, {
                propagator, useViewTransition: true
            });
        }
        return {
            hydrated: true
        }
    }
    
    async onNoXForm(self: this): ProPMP<TProps, TActions, ETProps> {
         return {
            hydrated: true,
         }
    }

}

export interface Mount<TProps = any, TActions = TProps> extends MountProps{}