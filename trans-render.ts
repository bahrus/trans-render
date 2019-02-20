import {define} from 'xtal-latx/define.js';
import {XtallatX} from 'xtal-latx/xtal-latx.js';
import {init} from './init.js';
import {repeatInit} from './repeatInit.js';
import {RenderContext} from './init.d.js';
//import {decorate} from 'trans-render/decorate.js';

//const spKey = '__xtal_deco_onPropsChange'; //special key

export class TransRender extends XtallatX(HTMLElement) {

    static get is() { return 'trans-render'; }
    connectedCallback() {
        this.style.display = 'none';
        this._upgradeProperties(['input']);
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
        if(this._input === undefined) return;
        const ctx = {
            init: init,
            Transform: this._evalObj,
            refs:{
                repeatInit: repeatInit,
                input: this._input,
            }
        } as RenderContext;
        init(this._nextSibling, ctx, this._nextSibling);
    }

    _input: any;
    get input(){
        return this._input;
    }
    set input(nv){
        this._input = nv;
        this.onPropsChange();
    }

}
define(TransRender);