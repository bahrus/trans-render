import { define } from './define.js';
import { hydrate, up } from './hydrate';
import { init } from './init.js';
import { repeatInit } from './repeatInit.js';
import { repeatUpdate } from './repeatUpdate.js';
import { interpolate } from './interpolate.js';
import { decorate } from './decorate.js';
//import {decorate} from 'trans-render/decorate.js';
//const spKey = '__xtal_deco_onPropsChange'; //special key
const view_model = 'view-model';
export class TransRender extends hydrate(HTMLElement) {
    static get is() { return 'trans-render'; }
    static get observedAttributes() {
        return super.observedAttributes.concat(view_model);
    }
    attributeChangedCallback(n, ov, nv) {
        switch (n) {
            case view_model:
                this.viewModel = JSON.parse(nv);
                break;
        }
        super.attributeChangedCallback(n, ov, nv);
    }
    connectedCallback() {
        this.style.display = 'none';
        this[up](['viewModel']);
        this.getElement('_nextSibling', t => t.nextElementSibling);
        this.getElement('_script', t => t.querySelector('script'));
    }
    getElement(fieldName, getter) {
        this[fieldName] = getter(this);
        if (!this[fieldName]) {
            setTimeout(() => {
                this.getElement(fieldName, getter);
            });
            return;
        }
        this.onPropsChange();
    }
    evaluateCode(scriptElement, target) {
        if (!this._evalObj) {
            this._evalObj = eval(scriptElement.innerHTML);
        }
    }
    onPropsChange() {
        if (!this._nextSibling || !this._script)
            return;
        this.evaluateCode(this._script, this._nextSibling);
        if (this._viewModel === undefined)
            return;
        const ctx = {
            init: init,
            interpolate: interpolate,
            decorate: decorate,
            repeatInit: repeatInit,
            repeatUpdate: repeatUpdate,
            //Transform: this._evalObj,
            viewModel: this._viewModel,
        };
        if (this._evalObj['Transform']) {
            Object.assign(ctx, this._evalObj);
        }
        else {
            ctx.Transform = this._evalObj;
        }
        init(this._nextSibling, ctx, this._nextSibling);
    }
    get viewModel() {
        return this._viewModel;
    }
    set viewModel(nv) {
        this._viewModel = nv;
        this.onPropsChange();
    }
}
define(TransRender);
