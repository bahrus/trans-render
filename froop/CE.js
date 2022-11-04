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
            const { AddMixins } = await import('./AddMixins.js');
            serviceClasses.addMixins = AddMixins;
        }
        const { CreatePropInfos } = await import('./CreatePropInfos.js');
        serviceClasses.createPropInfos = CreatePropInfos;
        const { AddProps } = await import('./AddProps.js');
        serviceClasses.addProps = AddProps;
        const config = args.config;
        if (config.actions !== undefined) {
            const { ConnectActions } = await import('./ConnectActions.js');
            serviceClasses.connectActions = ConnectActions;
        }
    }
    async #createServices(args) {
        args.main = this;
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
        const { addMixins, addProps, createPropInfos, connectActions } = serviceClasses;
        args.services = {
            createCustomEl: this,
            addMixins: addMixins ? new addMixins(args) : undefined,
            addProps: new addProps(args),
            createPropInfos: new createPropInfos(args),
            connectActions: connectActions ? new connectActions(args) : undefined,
        };
    }
    async #createClass(args) {
        const { services } = args;
        const { createPropInfos, addMixins } = services;
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
                services.createCustomEl.dispatchEvent(new CustomEvent(acb, {
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
                services.createCustomEl.dispatchEvent(new CustomEvent(ccb, {
                    detail: {
                        instance: this,
                    }
                }));
            }
            disconnectedCallback() {
                if (super.disconnectedCallback)
                    super.disconnectedCallback();
                services.createCustomEl.dispatchEvent(new CustomEvent(dcb, {
                    detail: {
                        instance: this
                    }
                }));
            }
        }
        this.custElClass = newClass;
        this.resolved = true;
        const { addProps, connectActions } = services;
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
