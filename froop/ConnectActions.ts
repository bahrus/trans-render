import {WCConfig} from '../lib/types';
import { ResolvableService } from "./ResolvableService.js";
import {npb, r} from './const.js';
import { DefineArgsWithServices, IConnectActions, INewPropBag } from './types';
import { hookupActions } from './hookupActions.js';


export class ConnectActions extends ResolvableService {
    constructor(public args: DefineArgsWithServices){
        super();
        args.main!.addEventListener(r, () => {
            this.#do(args);
        }, {once: true});

    }
    async #do(args: DefineArgsWithServices){
        const config  = args.config as WCConfig;
        
        const {services} = args;
        const {addProps} = services!;
        await addProps.resolve();
        addProps.addEventListener(npb, async e => {
            const propBagEvent = (e as CustomEvent).detail as INewPropBag;
            const {instance, propBag} = propBagEvent;
            const {hookupActions: doHookup} = await import('./hookupActions.js');
            await hookupActions(instance, propBag, args);
        });
    }
}

export interface ConnectActions extends IConnectActions{}