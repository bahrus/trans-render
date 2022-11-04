import { def } from '../lib/def.js';
import { acb, ccb, dcb, mse } from './const.js';
import { ReslvSvc } from './ReslvSvc.js';
export class CE extends ReslvSvc {
    args;
    constructor(args) {
        super();
        this.args = args;
        this.#evalConfig(args);
        this.#do(args);
    }
    async #do(args) {
        if (args.serviceClasses === undefined) {
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
        args.serviceClasses = {};
        const { serviceClasses } = args;
        if (args.mixins || args.superclass) {
            const { Mix } = await import('./Mix.js');
            serviceClasses.mixer = Mix;
        }
        const { PropRegistry } = await import('./PropRegistry.js');
        serviceClasses.propRegistry = PropRegistry;
        const { PropSvc } = await import('./PropSvc.js');
        serviceClasses.propper = PropSvc;
        const config = args.config;
        if (config.actions !== undefined) {
            const { Hookup } = await import('./Hookup.js');
            serviceClasses.hooker = Hookup;
        }
    }
    async #createServices(args) {
        args.definer = this;
        this.addSvcs(args);
        this.dispatchEvent(new Event(mse));
        await this.#createClass(args);
    }
    /**
     *
     * @param args
     * @overridable
     */
    async addSvcs(args) {
        const { serviceClasses } = args;
        const { mixer: mix, propper: propify, propRegistry, hooker: connectActions } = serviceClasses;
        args.services = {
            definer: this,
            mixer: mix ? new mix(args) : undefined,
            propify: new propify(args),
            propRegistry: new propRegistry(args),
            hooker: connectActions ? new connectActions(args) : undefined,
        };
    }
    async #createClass(args) {
        const { services } = args;
        const { propRegistry: createPropInfos, mixer: addMixins } = services;
        await createPropInfos.resolve();
        const ext = addMixins?.ext || HTMLElement;
        const config = args.config;
        const { tagName, formAss } = config;
        const observedAttributes = await createPropInfos.getAttrNames(ext);
        class newClass extends ext {
            static is = tagName;
            static observedAttributes = observedAttributes;
            static ceDef = args;
            static formAssociated = formAss;
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
            connectedCallback() {
                //console.log('connectedCallback');
                if (super.connectedCallback)
                    super.connectedCallback();
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
        const { propify: addProps, hooker: connectActions } = services;
        await addProps.resolve();
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
        const { InstResSvc } = await import('./InstResSvc.js');
        for (const svc of Object.values(services)) {
            if (svc instanceof InstResSvc) {
                await svc.instanceResolve(instance);
            }
        }
    }
}
