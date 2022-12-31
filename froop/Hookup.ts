import {WCConfig} from '../lib/types';
import { InstSvc } from "./InstSvc.js";
import {npb, mse, acb} from './const.js';
import { CEArgs, IHookup, INewPropagator, IAttrChgCB } from './types';

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
        const {propper, itemizer, definer} = services!;
        await itemizer.resolve();
        const config  = args.config as WCConfig;
        const defaults = {...args.complexPropDefaults, ...config.propDefaults} as any;
        const {allPropNames, propInfos} = itemizer;
        definer.addEventListener(acb, async e => {
            const acbE = (e as CustomEvent).detail as IAttrChgCB;
            const {instance, name, newVal, oldVal} = acbE;
            const {parse} = await import('./parse.js');
            await args.definer!.resolveInstanceSvcs(args, instance);
            await parse(acbE, propInfos, defaults);
        });
        
        propper.addEventListener(npb, async e => {
            const propagatorEvent = (e as CustomEvent).detail as INewPropagator;
            const {instance, propagator} = propagatorEvent;
            const {trigger} = await import('./trigger.js');
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
    #propUp<T>(instance: HTMLElement, props: string[], defaultValues?: T){
        for(const prop of props){
            let value = (<any>instance)[prop];
            if(value === undefined && defaultValues !== undefined){
                value = (<any>defaultValues)[prop];
            }
            if (instance.hasOwnProperty(prop)) {
                delete (<any>instance)[prop];
            }
            //some properties are read only.
            try{(<any>instance)[prop] = value;}catch{}
        }
    }
}

export interface Hookup extends IHookup{}