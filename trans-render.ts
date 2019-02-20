import {define} from 'xtal-latx/define.js';
import {XtallatX} from 'xtal-latx/xtal-latx.js';
import {init} from './init.js';
import {repeatInit} from './repeatInit.js';
import {repeatUpdate} from './repeatUpdate.js';
import {interpolate} from './interpolate.js';
import {decorate} from './decorate.js';
import {RenderContext} from './init.d.js';
import { update } from './update.js';
//import {decorate} from 'trans-render/decorate.js';

//const spKey = '__xtal_deco_onPropsChange'; //special key
const view_model = 'view-model';
export class TransRender extends XtallatX(HTMLElement) {

    static get is() { return 'trans-render'; }
    static get observedAttributes(){
        return super.observedAttributes.concat(view_model);
    }
    attributeChangedCallback(n: string, ov: string, nv: string){
        switch(n){
            case view_model:
                this.viewModel = JSON.parse(nv);
                break;
        }
        super.attributeChangedCallback(n, ov, nv);
    }
    connectedCallback() {
        this.style.display = 'none';
        this._upgradeProperties(['viewModel']);
        this.getElement('_nextSibling', t => (t.nextElementSibling as HTMLElement));
        this.getElement('_script', t => t.querySelector('script'));
    }
    _nextSibling: HTMLElement | undefined;
    _script: HTMLScriptElement | undefined;


    getElement(fieldName: string, getter: (t: TransRender) => HTMLElement | null){
        (<any>this)[fieldName] = getter(this);
        if(!(<any>this)[fieldName]){
            setTimeout(() =>{
                this.getElement(fieldName, getter);
            })
            return;
        }
        this.onPropsChange();
    }
    _evalObj: any;
    evaluateCode(scriptElement: HTMLScriptElement, target: HTMLElement) {
        if(!this._evalObj){
            this._evalObj = eval(scriptElement.innerHTML);
        }
    }

    onPropsChange(){
        if(!this._nextSibling || !this._script) return;
        this.evaluateCode(this._script, this._nextSibling);
        if(this._viewModel === undefined) return;
        const ctx = {
            init: init,
            //update: update,
            interpolate: interpolate,
            decorate: decorate,
            repeatInit: repeatInit,
            //repeatUpdate: repeatUpdate,
            Transform: this._evalObj,
            viewModel: this._viewModel,
        } as RenderContext;
        init(this._nextSibling, ctx, this._nextSibling);
    }

    _viewModel: any;
    get viewModel(){
        return this._viewModel;
    }
    set viewModel(nv){
        this._viewModel = nv;
        this.onPropsChange();
    }

}
define(TransRender);