import { InstResSvc } from "./InstResSvc.js";
import { npb, mse } from './const.js';
/**
 * Connects the prop change subscription via Propagate observer to the corresponding actions
 */
export class Hookup extends InstResSvc {
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
        const { propify } = services;
        propify.addEventListener(npb, async (e) => {
            const propagatorEvent = e.detail;
            const { instance, propBag } = propagatorEvent;
            const { trigger } = await import('./trigger.js');
            //console.log({instance, propBag});
            trigger(instance, propBag, args);
            this.instanceResolved = instance;
        });
        await propify.resolve();
        this.resolved = true;
    }
}
