import {WCConfig} from '../lib/types';
import { ResolvableService } from "./ResolvableService";
import {npb} from './const.js';
import { DefineArgsWithServices, IConnectActions, INewPropBag } from './types';
import { hookupActions } from './hookupActions.js';


export class ConnectActions extends ResolvableService {
    constructor(public args: DefineArgsWithServices){
        super();
        this.#do(args);

    }
    async #do(args: DefineArgsWithServices){
        const config  = args.config as WCConfig;
        
        const {services} = args;
        const {addProps} = services;
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