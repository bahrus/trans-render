import { ResolvableService } from "./ResolvableService.js";
import { npb, r } from './const.js';
import { hookupActions } from './hookupActions.js';
export class ConnectActions extends ResolvableService {
    args;
    constructor(args) {
        super();
        this.args = args;
        args.main.addEventListener(r, () => {
            this.#do(args);
        }, { once: true });
    }
    async #do(args) {
        const config = args.config;
        const { services } = args;
        const { addProps } = services;
        await addProps.resolve();
        addProps.addEventListener(npb, async (e) => {
            const propBagEvent = e.detail;
            const { instance, propBag } = propBagEvent;
            const { hookupActions: doHookup } = await import('./hookupActions.js');
            await hookupActions(instance, propBag, args);
        });
    }
}
