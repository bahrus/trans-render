import { define } from './define.js';
import { hydrate, propUp } from './hydrate.js';
import { init } from './init.js';
import { repeat } from './repeat.js';
import { interpolate } from './plugins/interpolate.js';
import { decorate } from './plugins/decorate.js';
import { update } from './update.js';
import { appendTag } from './plugins/appendTag.js';
import { repeateth } from './repeateth.js';
import { insertAdjacentTemplate } from './insertAdjacentTemplate.js';
import { replaceElementWithTemplate } from './replaceElementWithTemplate.js';
import { replaceTargetWithTag } from './replaceTargetWithTag.js';
import { pierce } from './pierce.js';
import { split } from './split.js';
const view_model = 'view-model';
/**
 * Alternative way of instantiating a template
 * @element trans-render
 *
 *
 */
export class TransRender extends hydrate(HTMLElement) {
    static get is() { return 'trans-render'; }
    static get observedAttributes() {
        return [view_model];
    }
    attributeChangedCallback(n, ov, nv) {
        switch (n) {
            case view_model:
                this.viewModel = JSON.parse(nv);
                break;
        }
    }
    connectedCallback() {
        this.style.display = 'none';
        this[propUp](['viewModel']);
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
            repeat: repeat,
            repeateth: repeateth,
            insertAdjacentTemplate: insertAdjacentTemplate,
            replaceElementWithTemplate: replaceElementWithTemplate,
            replaceTargetWithTag: replaceTargetWithTag,
            split: split,
            appendTag: appendTag,
            pierce: pierce,
            viewModel: this._viewModel,
            host: this
        };
        if (this._evalObj['Transform']) {
            Object.assign(ctx, this._evalObj);
        }
        else {
            ctx.Transform = this._evalObj;
        }
        if (ctx.update !== undefined) {
            update(ctx, this._nextSibling);
        }
        else {
            init(this._nextSibling, ctx, this._nextSibling);
            ctx.update = update;
        }
    }
    get viewModel() {
        return this._viewModel;
    }
    /**
     * model to base view on
     * @attr view-model
     */
    set viewModel(nv) {
        this._viewModel = nv;
        this.onPropsChange();
    }
}
define(TransRender);
