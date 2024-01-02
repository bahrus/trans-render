import {Scope} from './lib/types';
import { XForm } from './types';
export class TransRender extends HTMLElement{
    async getTarget(){
        const attrVal = this.getAttribute('scope');
        if(attrVal === null){
            return this.parentElement || this.shadowRoot || document;
        }
        const scope = (attrVal[0] === '[' ? JSON.parse(attrVal) : attrVal) as Scope
        const {findRealm} = await import('./lib/findRealm');
        return await findRealm(this, scope) as DocumentFragment;
    }
    getXForm(){
        const xform = this.getAttribute('xform')!;
        if(this.getAttribute('onload') === 'doEval'){
            return eval(xform) as XForm<any, any>;
        }else{
            return JSON.parse(xform) as XForm<any, any>;
        }
    }
    getModel(){
        const modelSrc = this.getAttribute('model-src');
        let model: any;
        if(modelSrc === null) {
            model = this.shadowRoot?.host
        }
        if(!model) throw 'NI';
        return model;
    }

    async connectedCallback(){
        const documentFragment = await this.getTarget();
        const xform = this.getXForm();
        const model = this.getModel();
        const {Transform} = await import('./Transform.js');
        Transform(documentFragment, model, xform)
    }
}
if(!customElements.get('trans-render')) customElements.define('trans-render', TransRender);