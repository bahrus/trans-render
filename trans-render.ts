import {Scope} from './lib/types';
import { TransRenderMethods, XForm } from './ts-refs/trans-render/types.js'; 
export class TransRender extends HTMLElement implements TransRenderMethods{
    async getTarget(){
        const attrVal = this.getAttribute('scope');
        if(attrVal === null){
            return this.parentElement || this.shadowRoot || document;
        }
        const scope = (attrVal[0] === '[' ? JSON.parse(attrVal) : attrVal) as Scope
        const {findRealm} = await import('./lib/findRealm.js');
        return await findRealm(this, scope) as DocumentFragment;
    }
    async getXForm(){
        let xform: string;
        const src = this.getAttribute('src');
        if(src !== null){
            const resp = await fetch(src);
            //TODO use import  when all browsers support
            xform = await resp.text();
        }else{
            xform = this.getAttribute('xform')!;
        }
        if(this.getAttribute('onload') === 'doEval'){
            return eval('(' + xform + ')') as XForm<any, any>;
        }else{
            return JSON.parse(xform) as XForm<any, any>;
        }
    }
    async getModel(){
        const modelSrc = this.getAttribute('model-src');
        let model: any;
        if(modelSrc === null) {
            model = (<any>this.getRootNode()).host;
        }
        if(!model) throw 'NI';
        const modelPath = this.getAttribute('model-path');
        if(modelPath !== null){
            const {getVal} = await import('./lib/getVal.js');
            model = await getVal({host: model}, modelPath);
        }
        return model;
    }

    get skipInit(){
        return this.hasAttribute('skip-init');
    }

    async connectedCallback(){
        const documentFragment = await this.getTarget();
        const xform = await this.getXForm();
        const model = await this.getModel();
        const {Transform} = await import('./Transform.js');
        Transform(documentFragment, model, xform, {
            skipInit: this.skipInit
        });
    }
}
if(!customElements.get('trans-render')) customElements.define('trans-render', TransRender);