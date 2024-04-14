import {O, OConfig} from './froop/O.js';
import { MntCfg, MountActions, MountProps, PPMP } from './types.js';
export {MntCfg, MountProps} from './types';

export class Mount<TProps = any, TActions = TProps> extends O<TProps, TActions> implements MountActions{
    static MntCfgMxn: OConfig<MountProps, MountActions> = {
        propInfo:{
            clonedTemplate: {
                type: 'Object',
                ro: true,
            }

        },
        actions:{
            mount:{
                ifNoneOf:['clonedTemplate']
            }
        }
    }

    #root: ShadowRoot | HTMLElement;
    #csr = false;
    get csr(){
        return this.#csr || this.hasAttribute('csr');
    }
    constructor(){
        super();
        const config = (<any>this.constructor).MntCfgMxn as MntCfg;
        const {shadowRootInit} = config;
        if(shadowRootInit){
            if(this.shadowRoot === null){
                this.#csr = true;
            }
            this.#root = this.shadowRoot!;
        }else{
            this.#root = this;
        }

    }

    #needToAppendClone = true;
    async #adopt(self: this, root: ShadowRoot){
        // const styles = ((<any>self.constructor).config as MntCfg).styles;
        // if(styles === undefined) return;
        // const {DoStyles} = await import('./lib/mixins/DoStyles.js');
        // new DoStyles(this, styles, root, compiledStyleMap, modernBrowser);
            
    }
    inspect(self: this): Partial<MountProps> {
        return {
            
        }
    }
    async mount(self: this): PPMP {
        const {shadowRoot, children} = self;
        let root = self as any;
        if(shadowRootMode){
            if(shadowRoot === null){
                root = this.attachShadow({mode: shadowRootMode});
                this.#needToAppendClone = true;
                await this.#adopt(this, root);
            }else{
                root = shadowRoot;
            }
        }else{
            if(self.hasChildNodes()){
                this.#needToAppendClone = true;
            }
        }
        return {} as Partial<MountProps>
    }

    hydrate(self: this): Partial<MountProps> {
        return {

        }
    }
}

export interface Mount<TProps = any, TActions = TProps> extends MountProps{}