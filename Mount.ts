import {O, OConfig} from './froop/O.js';
import { MntCfg, MountActions, MountProps, PMP, ProPMP } from './types.js';
export {MntCfg, MountProps, MountActions} from './types';


export class Mount<TProps = any, TActions = TProps, ETProps = TProps> 
        extends O<TProps, TActions> 
        implements MountActions<TProps, TActions, ETProps>{
    static mntCfgMxn: OConfig<MountProps, MountActions> = {
        propInfo:{
            clonedTemplate: {
                type: 'Object',
                ro: true,
            },
            hydrated: {
                type: 'Boolean',
                ro: true,
            }

        },
        actions:{
            cloneMT: {
                ifAllOf: 'csr'
            },
            initCSRXform: {
                ifAllOf: ['clonedTemplate', 'xform']
            },
            mountClone: {
                ifAllOf: ['clonedTemplate', 'hydrated']
            },
            initSSRXform: {
                ifAllOf: ['xform'],
                ifNoneOf: ['csr'],
            },
            onNoXForm:{
                ifNoneOf: ['xform']
            }
        }
    }

    #root: ShadowRoot | HTMLElement;
    #csr = false;
    get csr(){
        return this.#csr || this.hasAttribute('csr');
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
    constructor(){
        super();
        const {config} = this;
        const {shadowRootInit, styles} = config;
        if(shadowRootInit){
            if(this.shadowRoot === null){
                this.attachShadow(shadowRootInit);
                this.#csr = true;
            }else{
                const declarativeStyles = Array.from(this.shadowRoot.querySelectorAll('style[adopt]'));
                config.styles = declarativeStyles.map(x => x.innerHTML);
            }
            this.#root = this.shadowRoot!;
            let stringStyles: Array<string> | undefined;
            if(typeof(styles) === 'string'){
                stringStyles = [styles];
            }else if(Array.isArray(styles) && styles.length > 0 && typeof(styles[0]) === 'string'){
                stringStyles = styles as Array<string>;
            }
            if(stringStyles !== undefined){
                stringStyles = stringStyles.map(x => x.replace("<style>", "").replace("</style>", ""));
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
        let {mainTemplate} = config;
        if(typeof mainTemplate === 'string'){
            const templ = document.createElement('template');
            templ.innerHTML = mainTemplate;
            config.mainTemplate = templ;
            mainTemplate = templ;
        }
        const clonedTemplate = mainTemplate.content.cloneNode(true);
        return {
            clonedTemplate
        } as Partial<MountProps>
    }
    async initCSRXform(self: this): ProPMP<TProps, TActions, ETProps> {
        const {clonedTemplate, xform, propagator} = self;
        const {Transform} = await import('./Transform.js');
        await Transform(clonedTemplate!, this, xform!, {
            propagator
        });
        return {
            hydrated: true,
        }
    }
    mountClone(self: this): PMP<TProps, TActions, ETProps> {
        const {clonedTemplate} = self;
        this.#root.appendChild(clonedTemplate!);
        return {

        }
    }
    async initSSRXform(self: this): ProPMP<TProps, TActions, ETProps> {
        const root = self.#root;
        const {xform, propagator} = self;
        const {Transform} = await import('./Transform.js');
        await Transform(root, this, xform!, {
            propagator
        });
        return {
            hydrated: true
        }
    }
    async onNoXForm(self: this): ProPMP<TProps, TActions, ETProps> {
         return {
            hydrated: true,
         }
    }
    // async #adopt(self: this, root: ShadowRoot){
    //     // const styles = ((<any>self.constructor).config as MntCfg).styles;
    //     // if(styles === undefined) return;
    //     // const {DoStyles} = await import('./lib/mixins/DoStyles.js');
    //     // new DoStyles(this, styles, root, compiledStyleMap, modernBrowser);
            
    // }
    // inspect(self: this): Partial<MountProps> {
    //     return {
            
    //     }
    // }
    // async mount(self: this): PPMP {
    //     const {shadowRoot, children} = self;
    //     let root = self as any;
    //     if(shadowRootMode){
    //         if(shadowRoot === null){
    //             root = this.attachShadow({mode: shadowRootMode});
    //             this.#needToAppendClone = true;
    //             await this.#adopt(this, root);
    //         }else{
    //             root = shadowRoot;
    //         }
    //     }else{
    //         if(self.hasChildNodes()){
    //             this.#needToAppendClone = true;
    //         }
    //     }
    //     return {} as Partial<MountProps>
    // }

    // hydrate(self: this): Partial<MountProps> {
    //     return {

    //     }
    // }
}

export interface Mount<TProps = any, TActions = TProps> extends MountProps{}