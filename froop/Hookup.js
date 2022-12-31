import { InstSvc } from "./InstSvc.js";
import { npb, mse, acb } from './const.js';
/**
 * Connects the prop change subscription via Propagate observer to the corresponding actions
 */
export class Hookup extends InstSvc {
    args;
    constructor(args) {
        super();
        this.args = args;
        args.definer.addEventListener(mse, () => {
            this.#do(args);
        }, { once: true });
    }
    async #do(args) {
        const { services } = args;
        const { propper, itemizer, definer } = services;
        await itemizer.resolve();
        const config = args.config;
        const defaults = { ...args.complexPropDefaults, ...config.propDefaults };
        const { allPropNames, propInfos } = itemizer;
        definer.addEventListener(acb, async (e) => {
            const acbE = e.detail;
            const { instance, name, newVal, oldVal } = acbE;
            const { parse } = await import('./parse.js');
            await args.definer.resolveInstanceSvcs(args, instance);
            await parse(acbE, propInfos, defaults);
        });
        propper.addEventListener(npb, async (e) => {
            const propagatorEvent = e.detail;
            const { instance, propagator } = propagatorEvent;
            const { trigger } = await import('./trigger.js');
            //console.debug({instance, propagator});
            trigger(instance, propagator, args);
            this.instanceResolved = instance;
            this.#propUp(instance, allPropNames, defaults);
        });
        await propper.resolve();
        this.resolved = true;
    }
    /**
     * Needed for asynchronous loading
     * @param props Array of property names to "upgrade", without losing value set while element was Unknown
     * @param defaultValues:   If property value not set, set it from the defaultValues lookup
     * @private
     */
    #propUp(instance, props, defaultValues) {
        for (const prop of props) {
            let value = instance[prop];
            if (value === undefined && defaultValues !== undefined) {
                value = defaultValues[prop];
            }
            if (instance.hasOwnProperty(prop)) {
                delete instance[prop];
            }
            //some properties are read only.
            try {
                instance[prop] = value;
            }
            catch { }
        }
    }
}
