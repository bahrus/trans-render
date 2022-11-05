import {WCConfig} from '../lib/types';
import { InstSvc } from "./InstSvc.js";
import {npb, r, mse} from './const.js';
import { CEArgs, IHookup, INewPropagator as INewPropagator } from './types';

/**
 * Connects the prop change subscription via Propagate observer to the corresponding actions
 */
export class Hookup extends InstSvc {
    constructor(public args: CEArgs){
        super();
        args.definer!.addEventListener(mse, () => {
            this.#do(args);
        }, {once: true});

    }
    async #do(args: CEArgs){
        
        const {services} = args;
        const {propper: propify} = services!;
        
        propify.addEventListener(npb, async e => {
            const propagatorEvent = (e as CustomEvent).detail as INewPropagator;
            const {instance, propagator: propBag} = propagatorEvent;
            const {trigger} = await import('./trigger.js');
            //console.log({instance, propBag});
            trigger(instance, propBag, args);
            this.instanceResolved = instance;
        });
        await propify.resolve();
        this.resolved = true;
    }
}

export interface Hookup extends IHookup{}