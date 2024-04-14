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
            mount: {
                ifNoneOf: ['clonedTemplate']
            }
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
    #needToAppendClone = true;
    async #adopt(self, root) {
        // const styles = ((<any>self.constructor).config as MntCfg).styles;
        // if(styles === undefined) return;
        // const {DoStyles} = await import('./lib/mixins/DoStyles.js');
        // new DoStyles(this, styles, root, compiledStyleMap, modernBrowser);
    }
    inspect(self) {
        return {};
    }
    async mount(self) {
        const { shadowRoot, children } = self;
        let root = self;
        if (shadowRootMode) {
            if (shadowRoot === null) {
                root = this.attachShadow({ mode: shadowRootMode });
                this.#needToAppendClone = true;
                await this.#adopt(this, root);
            }
            else {
                root = shadowRoot;
            }
        }
        else {
            if (self.hasChildNodes()) {
                this.#needToAppendClone = true;
            }
        }
        return {};
    }
    hydrate(self) {
        return {};
    }
}
