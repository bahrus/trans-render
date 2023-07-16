import { def } from '../lib/def.js';
import { acb, ccb, dcb, mse } from './const.js';
import { Svc } from './Svc.js';
export class CE extends Svc {
    args;
    constructor(args) {
        super();
        this.args = args;
        this.#evalConfig(args);
        this.#do(args);
    }
    async #do(args) {
        if (args.servers === undefined) {
            await this.addSvcClasses(args);
        }
        await this.#createServices(args);
    }
    /**
     *
     * @param args
     * @overridable
     */
    async addSvcClasses(args) {
        if (args.servers === undefined)
            args.servers = {};
        const { servers: serviceClasses } = args;
        if (args.mixins || args.superclass) {
            const { Mix } = await import('./Mix.js');
            serviceClasses.mixer = Mix;
        }
        const { PropRegistry } = await import('./PropRegistry.js');
        serviceClasses.itemizer = PropRegistry;
        const { PropSvc } = await import('./PropSvc.js');
        serviceClasses.propper = PropSvc;
        const { config } = args;
        const { actions, propDefaults } = config;
        //const config = args.config as WCConfig;
        if (actions || propDefaults) {
            const { Hookup } = await import('./Hookup.js');
            serviceClasses.hooker = Hookup;
        }
    }
    async #createServices(args) {
        args.definer = this;
        const { servers } = args;
        args.services = {
            definer: this
        };
        for (const key in servers) {
            args.services[key] = new servers[key](args);
        }
        this.dispatchEvent(new Event(mse));
        await this.#createClass(args);
    }
    async #createClass(args) {
        const { services } = args;
        const { itemizer, mixer } = services;
        await itemizer.resolve();
        const ext = mixer?.ext || HTMLElement;
        const config = args.config;
        const { tagName, formAss, isEnh } = config;
        const observedAttributes = isEnh ? undefined : await itemizer.getAttrNames(ext);
        class newClass extends ext {
            static is = tagName;
            static observedAttributes = observedAttributes;
            static ceDef = args;
            static formAssociated = formAss;
            constructor() {
                super();
                if (this.attachInternals !== undefined && !isEnh) {
                    this._internals_ = this.attachInternals(); //Safari 16.4 doesn't yet support
                }
            }
            attributeChangedCallback(name, oldVal, newVal) {
                if (super.attributeChangedCallback)
                    super.attributeChangedCallback(name, oldVal, newVal);
                services.definer.dispatchEvent(new CustomEvent(acb, {
                    detail: {
                        instance: this,
                        name,
                        oldVal,
                        newVal,
                    }
                }));
            }
            async connectedCallback() {
                //console.debug('connectedCallback');
                if (super.connectedCallback)
                    super.connectedCallback();
                const dh = 'defer-hydration';
                if (!isEnh) {
                    if (this.hasAttribute(dh)) {
                        const { wfac } = await import('../lib/wfac.js');
                        await wfac(this, dh, (s) => s === null);
                    }
                }
                //console.log({propper: services?.propper, createPropBag: services?.propper.createPropBag});
                //services?.propper.createPropBag(this as any as HTMLElement);
                services.definer.dispatchEvent(new CustomEvent(ccb, {
                    detail: {
                        instance: this,
                    }
                }));
            }
            disconnectedCallback() {
                if (super.disconnectedCallback)
                    super.disconnectedCallback();
                services.definer.dispatchEvent(new CustomEvent(dcb, {
                    detail: {
                        instance: this
                    }
                }));
            }
        }
        this.custElClass = newClass;
        this.resolved = true;
        const { propper, /*hooker: connectActions*/ } = services;
        await propper.resolve();
        //await connectActions?.resolve();
        def(newClass);
    }
    async #evalConfig(args) {
        if (args === undefined)
            return;
        const { config } = args;
        if (typeof config != 'function')
            return;
        args.config = (await config()).default;
    }
    async resolveInstanceSvcs(args, instance) {
        const { services } = args;
        const { InstSvc } = await import('./InstSvc.js');
        for (const svc of Object.values(services)) {
            if (svc instanceof InstSvc) {
                await svc.instanceResolve(instance);
            }
        }
    }
}
