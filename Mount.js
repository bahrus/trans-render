import { O } from './froop/O.js';
import { MntCfgMxn } from './MntCfgMxn.js';
export class Mount extends O {
    static mntCfgMxn = MntCfgMxn;
    #root;
    #csr = false;
    get csr() {
        return (this.config.assumeCSR && !this.hasAttribute('no-csr')) || this.#csr || this.hasAttribute('csr');
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
    get xxform() {
        return this.config.xxform;
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
            else if (!styles) {
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
            else if (typeof (styles) === undefined) {
                stringStyles = [''];
            }
            if (stringStyles !== undefined) {
                stringStyles = stringStyles.map(x => x.replace("<style>", "").replace("</style>", ""));
                stringStyles[0] += String.raw `
* {
    --attrs-to-reflect: initial;
}
                `;
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
        let { mainTemplate, appendOnClone } = config;
        if (typeof mainTemplate === 'string') {
            const templ = document.createElement('template');
            templ.innerHTML = mainTemplate;
            config.mainTemplate = templ;
            mainTemplate = templ;
        }
        const clonedTemplate = mainTemplate.content.cloneNode(true);
        if (appendOnClone) {
            this.#root.appendChild(clonedTemplate);
        }
        return {
            clonedTemplate
        };
    }
    async initCSRXform(self) {
        const { clonedTemplate, xform, propagator, xxform } = self;
        const { Transform } = await import('./Transform.js');
        if (xform !== undefined) {
            await Transform(clonedTemplate, this, xform, {
                propagator,
                propagatorIsReady: true,
            });
        }
        if (xxform !== undefined) {
            await Transform(clonedTemplate, this, xxform, {
                propagator,
                propagatorIsReady: true,
                useViewTransition: true,
            });
        }
        return {
            hydrated: true,
        };
    }
    mountClone(self) {
        const { clonedTemplate, config } = self;
        const { appendOnClone } = config;
        if (!appendOnClone) {
            this.#root.appendChild(clonedTemplate);
        }
        return {};
    }
    async initSSRXform(self) {
        const root = self.#root;
        const { xform, propagator, xxform } = self;
        const { Transform } = await import('./Transform.js');
        if (xform !== undefined) {
            await Transform(root, this, xform, {
                propagator
            });
        }
        if (xxform !== undefined) {
            await Transform(root, this, xform, {
                propagator, useViewTransition: true
            });
        }
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
