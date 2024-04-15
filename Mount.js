import { O } from './froop/O.js';
export class Mount extends O {
    static mntCfgMxn = {
        propInfo: {
            clonedTemplate: {
                type: 'Object',
                ro: true,
            },
            hydrated: {
                type: 'Boolean',
                ro: true,
            }
        },
        actions: {
            cloneMT: {
                ifAllOf: 'csr'
            },
            initCSRXform: {
                ifAllOf: ['clonedTemplate', 'xform']
            },
            mountClone: {
                ifAllOf: ['clonedTemplate', 'hydrated']
            },
            initSSRXform: {
                ifAllOf: ['xform'],
                ifNoneOf: ['csr'],
            },
            onNoXForm: {
                ifNoneOf: ['xform']
            }
        }
    };
    #root;
    #csr = false;
    get csr() {
        return this.#csr || this.hasAttribute('csr');
    }
    get config() {
        return this.constructor.config;
    }
    // get mntConfig(){
    //     return (<any>this.constructor).mntCfgMxn as OConfig;
    // }
    get xform() {
        return this.config.xform;
    }
    constructor() {
        super();
        const { config } = this;
        const { shadowRootInit, styles } = config;
        if (shadowRootInit) {
            if (this.shadowRoot === null) {
                this.attachShadow(shadowRootInit);
                this.#csr = true;
            }
            else {
                const declarativeStyles = Array.from(this.shadowRoot.querySelectorAll('style[adopt]'));
                config.styles = declarativeStyles.map(x => x.innerHTML);
            }
            this.#root = this.shadowRoot;
            let stringStyles;
            if (typeof (styles) === 'string') {
                stringStyles = [styles];
            }
            else if (Array.isArray(styles) && styles.length > 0 && typeof (styles[0]) === 'string') {
                stringStyles = styles;
            }
            if (stringStyles !== undefined) {
                stringStyles = stringStyles.map(x => x.replace("<style>", "").replace("</style>", ""));
                const CSSStyleSheets = [];
                for (const stringSyleSheet of stringStyles) {
                    const newSheet = new CSSStyleSheet();
                    newSheet.replaceSync(stringSyleSheet);
                    CSSStyleSheets.push(newSheet);
                }
                config.styles = CSSStyleSheets;
            }
            if (this.#csr) {
                let compiledStyles = config.styles;
                if (compiledStyles !== undefined) {
                    this.shadowRoot.adoptedStyleSheets = [...compiledStyles];
                }
            }
        }
        else {
            this.#root = this;
        }
    }
    cloneMT(self) {
        const { config } = this;
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
    async initCSRXform(self) {
        const { clonedTemplate, xform, propagator } = self;
        const { Transform } = await import('./Transform.js');
        await Transform(clonedTemplate, this, xform, {
            propagator
        });
        return {
            hydrated: true,
        };
    }
    mountClone(self) {
        const { clonedTemplate } = self;
        this.#root.appendChild(clonedTemplate);
        return {};
    }
    async initSSRXform(self) {
        const root = self.#root;
        const { xform, propagator } = self;
        const { Transform } = await import('./Transform.js');
        await Transform(root, this, xform, {
            propagator
        });
        return {
            hydrated: true
        };
    }
    async onNoXForm(self) {
        return {
            hydrated: true,
        };
    }
}
