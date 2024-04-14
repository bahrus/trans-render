import { O } from './froop/O.js';
export class Mount extends O {
    static MntCfgMxn = {
        propInfo: {
            clonedTemplate: {
                type: 'Object',
                ro: true,
            }
        },
        actions: {
            cloneMT: {
                ifAllOf: 'csr'
            }
            // mount:{
            //     ifNoneOf:['clonedTemplate']
            // }
        }
    };
    #root;
    #csr = false;
    get csr() {
        return this.#csr || this.hasAttribute('csr');
    }
    constructor() {
        super();
        const config = this.constructor.MntCfgMxn;
        const { shadowRootInit } = config;
        if (shadowRootInit) {
            if (this.shadowRoot === null) {
                this.#csr = true;
            }
            this.#root = this.shadowRoot;
        }
        else {
            this.#root = this;
        }
    }
    cloneMT(self) {
        const config = this.constructor.MntCfgMxn;
        let { mainTemplate } = config;
        if (typeof mainTemplate === 'string') {
            const templ = document.createElement('template');
            templ.innerHTML = mainTemplate;
            config.mainTemplate = templ;
            mainTemplate = templ;
        }
        const clonedTemplate = mainTemplate.content.cloneNode(true);
        return {
            clonedTemplate
        };
    }
}
