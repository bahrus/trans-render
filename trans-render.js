import { define } from 'xtal-latx/define.js';
import { XtallatX } from 'xtal-latx/xtal-latx.js';
import { init } from './init.js';
import { repeatInit } from './repeatInit.js';
import { interpolate } from './interpolate.js';
import { decorate } from './decorate.js';
//import {decorate} from 'trans-render/decorate.js';
//const spKey = '__xtal_deco_onPropsChange'; //special key
export class TransRender extends XtallatX(HTMLElement) {
    static get is() { return 'trans-render'; }
    connectedCallback() {
        this.style.display = 'none';
        this._upgradeProperties(['viewModel']);
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
            //update: update,
            interpolate: interpolate,
            decorate: decorate,
            repeatInit: repeatInit,
            //repeatUpdate: repeatUpdate,
            Transform: this._evalObj,
            viewModel: this._viewModel,
        };
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
