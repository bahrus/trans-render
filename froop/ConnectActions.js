import { InstResSvc } from "./InstResSvc.js";
import { npb, mse } from './const.js';
/**
 * Connects the prop change subscription via PropBag observer to the corresponding actions
 */
export class ConnectActions extends InstResSvc {
    args;
    constructor(args) {
        super();
        this.args = args;
        args.main.addEventListener(mse, () => {
            this.#do(args);
        }, { once: true });
    }
    async #do(args) {
        const { services } = args;
        const { addProps } = services;
        await addProps.resolve();
        addProps.addEventListener(npb, async (e) => {
            const propBagEvent = e.detail;
            const { instance, propBag } = propBagEvent;
            const { hookupActions } = await import('./hookupActions.js');
            //console.log({instance, propBag});
            await hookupActions(instance, propBag, args);
            this.instanceResolved = instance;
        });
        this.resolved = true;
    }
}
