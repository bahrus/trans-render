export class MyPeerElement extends HTMLElement {
    #someBoolProp = false;
    get someBoolProp() {
        return this.#someBoolProp;
    }
    set someBoolProp(nv) {
        this.#someBoolProp = nv;
        const strVal = nv === undefined ? '' : nv.toLocaleString();
        const div = this.shadowRoot?.querySelector('#someBoolPropVal');
        if (div !== null && div !== undefined)
            div.textContent = strVal;
    }
    negateIt() {
        this.someBoolProp = !this.someBoolProp;
    }
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
    connectedCallback() {
        this.shadowRoot.innerHTML = String.raw `
        <div itemscope>
            <div  id=someBoolPropVal></div>
        </div>
        `;
    }
}
customElements.define('my-peer-element', MyPeerElement);
