import { RHS } from '../../types.js';
import { Action, PropInfo } from '../types.js';
export { Action, PropInfo } from '../types.js';

export {XForm} from '../../types.js'

import { TemplMgmtBase, TemplMgmtProps } from './types.js';
export { TemplMgmtProps, TemplMgmtActions } from './types.js';

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
        const styles = (<any>base.constructor).ceDef.config.propDefaults.styles;
        if(styles === undefined) return;
        const {DoStyles} = await import('./DoStyles.js');
        new DoStyles(this, styles, root, compiledStyleMap, modernBrowser);
            
    }
    async cloneTemplate(self: TemplMgmtBase){
        const {shadowRootMode, shadowRoot, mainTemplate, skipTemplateClone, xform} = self;

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
        this.#repeatVisit = true;
        if(skipTemplateClone){
            this.#needToAppendClone = false;
            this.clonedTemplate = this.shadowRoot || this;
            this.skipTemplateClone = false;
        }else{
            switch(typeof mainTemplate){
                case 'string':
                    //const isReally = (<any>this.constructor).isReally as string;
                    let templ: HTMLTemplateElement | undefined = compiledTemplateMap.get(mainTemplate)!
                    if(templ === undefined){
                        templ = document.createElement('template');
                        templ.innerHTML = mainTemplate;
                        compiledTemplateMap.set(mainTemplate, templ);
                    }
                    this.clonedTemplate = templ.content.cloneNode(true);
                    break;
                default:
                    this.clonedTemplate = mainTemplate!.content.cloneNode(true);
            }
        }

        
        
    }
    #mounted = false;
    async doTemplMount(base: TemplMgmtBase){
        if(this.#mounted) return;
        this.#mounted = true;
        const {xform, xformImpl, clonedTemplate, shadowRootMode, lcXform} = base;
        const fragment = clonedTemplate === undefined ? 
            !shadowRootMode ? this : this.shadowRoot!
            : clonedTemplate as DocumentFragment;
        if(!(fragment instanceof ShadowRoot)){
            (<any>fragment).host = this;
        }
        
        if(xform){
            if(xformImpl !== undefined){
                (await xformImpl())(fragment, this, xform as Partial<{[key: string]: RHS<HTMLElement, HTMLElement>}>, (<any>this).xtalState);
            }else{
                const {Transform} = await import('../../Transform.js');
                await Transform(fragment, this, xform, {
                    propagator: (<any>this).xtalState
                });
            }

            //await MainTransforms(this as any as TemplMgmtBaseMixin & HTMLElement, base, fragment as DocumentFragment);
        }
        if(shadowRootMode && lcXform){
            const {Transform} = await import('../../Transform.js');
            await Transform(this, this, lcXform, {
                propagator: (<any>this).xtalState
            });
        }
        if(this.#needToAppendClone){
            const root = !shadowRootMode ? this : this.shadowRoot!;
            root.appendChild(fragment);
            this.#needToAppendClone = false;
        }
        //this.removeAttribute('defer-rendering');
        const states = (<any>base)._internals_?.states;
        if(states !== undefined){ //Safari <= 16.4
            states.add('--mounted');
        }
        
        this.clonedTemplate = undefined;
    }


}

export const beCloned = {
    cloneTemplate: {
        ifAllOf: ['mainTemplate'],
        ifKeyIn: ['shadowRootMode', 'waitToInit'],
        //ifNoneOf: ['skipTemplateClone']
    } as Action<TemplMgmtProps>,
}


export const propInfo: Partial<{[key in keyof TemplMgmtProps]: PropInfo}> = {
    clonedTemplate:{
        parse: false,
    },
    xform:{
        parse: false,
    },
    lcXform:{
        parse: false,
    },
    styles: {
        parse: false,
    },
    skipTemplateClone:{
        parse: false,
    }
}

export const beMounted = {
    doTemplMount: {
        ifAllOf: ['clonedTemplate'],
        ifKeyIn: ['xform'],
        async: true,
    } as Action<TemplMgmtProps>,
}

export const beTransformed = {
    ...beCloned,
    ...beMounted
};
