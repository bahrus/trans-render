import {WCConfig} from '../lib/types';
import { ResolvableService } from "./ResolvableService";
import { DefineArgsWithServices, IConnectActions } from './types';


export class ConnectActions extends ResolvableService{
    constructor(public args: DefineArgsWithServices){
        super();
        this.#do(args);

    }
    async #do(args: DefineArgsWithServices){
        const config  = args.config as WCConfig;
        
        const {services} = args;
        const {addProps} = services;
    }
}