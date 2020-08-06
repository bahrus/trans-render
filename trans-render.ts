import {define} from './define.js';
import {hydrate, propUp} from './hydrate.js';
import {init} from './init.js';
import {repeat} from './repeat.js';
import {interpolate} from './interpolate.js';
import {decorate} from './decorate.js';
import {RenderContext, TransRenderWC} from './types_old.js';
import { update } from './update.js';
import {appendTag} from './appendTag.js';
import {repeateth} from './repeateth.js';
import {insertAdjacentTemplate} from './insertAdjacentTemplate.js';
import {replaceElementWithTemplate} from './replaceElementWithTemplate.js';
import {replaceTargetWithTag} from './replaceTargetWithTag.js';
import {pierce} from './pierce.js';
import {split} from './split.js';

//import {decorate} from 'trans-render/decorate.js';

type prop = keyof TransRenderWC;
const view_model = 'view-model';
/**
 * Alternative way of instantiating a template
 * @element trans-render
 * 
 * 
 */
export class TransRender extends hydrate(HTMLElement) implements TransRenderWC {

    static get is() { return 'trans-render'; }
    static get observedAttributes(){
        return [view_model];
    }
    attributeChangedCallback(n: string, ov: string, nv: string){
        switch(n){
            case view_model:
                this.viewModel = JSON.parse(nv);
                break;
        }
        
    }
    connectedCallback() {
        this.style.display = 'none';
        this[propUp]<prop[]>(['viewModel']);
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
            interpolate: interpolate,
            decorate: decorate,
            repeat: repeat,
            repeateth: repeateth,
            insertAdjacentTemplate: insertAdjacentTemplate,
            replaceElementWithTemplate: replaceElementWithTemplate,
            replaceTargetWithTag: replaceTargetWithTag,
            split: split,
            appendTag: appendTag,
            pierce: pierce,
            viewModel: this._viewModel,
            host: this as HTMLElement
        } as RenderContext;
        if(this._evalObj['Transform']){
            Object.assign(ctx, this._evalObj);
        }else{
            ctx.Transform = this._evalObj;
        }
        if(ctx.update !== undefined){
            update(ctx, this._nextSibling)
        }else{
            init(this._nextSibling, ctx, this._nextSibling);
            ctx.update = update;
        }
        
    }

    _viewModel!: object;
    get viewModel(){
        return this._viewModel;
    }
    /**
     * model to base view on
     * @attr view-model
     */
    set viewModel(nv){
        this._viewModel = nv;
        this.onPropsChange();
    }

}
define(TransRender);

declare global {
    interface HTMLElementTagNameMap {
        'trans-render': TransRender,
    }
}