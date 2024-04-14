import {O, OConfig} from './froop/O.js';
import { MntCfg, MountActions, MountProps, PPMP, ProPMP } from './types.js';
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
            hydrateClone: {
                ifAllOf: ['clonedTemplate', 'xform']
            },
            mountClone: {
                ifAllOf: ['clonedTemplate', 'hydrated']
            },
            hydrateRoot: {
                ifAllOf: ['xform'],
                ifNoneOf: ['csr'],
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
        const {shadowRootInit} = config;
        if(shadowRootInit){
            if(this.shadowRoot === null){
                this.attachShadow(shadowRootInit);
                this.#csr = true;
            }
            this.#root = this.shadowRoot!;
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
    async hydrateClone(self: this): ProPMP<TProps, TActions, ETProps> {
        const {clonedTemplate, xform, propagator} = self;
        const {Transform} = await import('./Transform.js');
        await Transform(clonedTemplate!, this, xform!, {
            propagator
        });
        return {
            hydrated: true,
        }
    }
    mountClone(self: this): PPMP<TProps, TActions, ETProps> {
        const {clonedTemplate} = self;
        this.#root.appendChild(clonedTemplate!);
        return {

        }
    }
    async hydrateRoot(self: this): ProPMP<TProps, TActions, ETProps> {
        const root = self.#root;
        const {xform, propagator} = self;
        const {Transform} = await import('./Transform.js');
        await Transform(root, this, xform!, {
            propagator
        });
        return {

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