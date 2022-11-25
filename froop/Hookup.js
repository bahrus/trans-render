import { InstSvc } from "./InstSvc.js";
import { npb, mse } from './const.js';
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
        const { propper } = services;
        propper.addEventListener(npb, async (e) => {
            const propagatorEvent = e.detail;
            const { instance, propagator } = propagatorEvent;
            const { trigger } = await import('./trigger.js');
            console.debug({ instance, propagator });
            trigger(instance, propagator, args);
            this.instanceResolved = instance;
        });
        await propper.resolve();
        this.resolved = true;
    }
}
