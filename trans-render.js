export class TransRender extends HTMLElement {
    async getTarget() {
        const attrVal = this.getAttribute('scope');
        if (attrVal === null) {
            return this.parentElement || this.shadowRoot || document;
        }
        const scope = (attrVal[0] === '[' ? JSON.parse(attrVal) : attrVal);
        const { findRealm } = await import('./lib/findRealm.js');
        return await findRealm(this, scope);
    }
    getXForm() {
        const xform = this.getAttribute('xform');
        if (this.getAttribute('onload') === 'doEval') {
            return eval('(' + xform + ')');
        }
        else {
            return JSON.parse(xform);
        }
    }
    async getModel() {
        const modelSrc = this.getAttribute('model-src');
        let model;
        if (modelSrc === null) {
            model = this.getRootNode().host;
        }
        if (!model)
            throw 'NI';
        const modelPath = this.getAttribute('model-path');
        if (modelPath !== null) {
            const { getVal } = await import('./lib/getVal.js');
            model = await getVal({ host: model }, modelPath);
        }
        return model;
    }
    async connectedCallback() {
        const documentFragment = await this.getTarget();
        const xform = this.getXForm();
        const model = await this.getModel();
        const { Transform } = await import('./Transform.js');
        Transform(documentFragment, model, xform);
    }
}
if (!customElements.get('trans-render'))
    customElements.define('trans-render', TransRender);
