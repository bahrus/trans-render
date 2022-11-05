import { DefineArgs, LogicOp, PropInfo, HasPropChangeQueue, Action, PropInfoTypes, PropChangeInfo, PropChangeMoment, ListOfLogicalExpressions, TRElementProps, PropChangeMethod, TRElementActions, WCConfig, IActionProcessor } from '../lib/types.js';
export { Action, PropInfo, TRElementActions, TRElementProps, WCConfig, IActionProcessor as IHasPostHoc} from '../lib/types.js';
import { def } from '../lib/def.js';
import {IMix, CEArgs, IDefine, IAttrChgCB, IConnectedCB, IDisconnectedCB, CEServices} from './types';
import {acb, ccb, dcb, mse} from './const.js';
import { Svc } from './Svc.js';


export class CE<TProps = any, TActions = TProps, TPropInfo = PropInfo, TAction extends Action<TProps> = Action<TProps>> extends Svc{
    constructor(public args: CEArgs<TProps, TActions, TPropInfo, TAction>){
        super();
        this.#evalConfig(args as CEArgs);
        this.#do(args as CEArgs);
    }

    async #do(args: CEArgs){
        if(args.servers === undefined){
            await this.addSvcClasses(args);
        }
        await this.#createServices(args);

    }

    /**
     * 
     * @param args 
     * @overridable
     */
    async addSvcClasses(args: CEArgs){
        args.servers = {};
        const {servers: serviceClasses} = args;
        if(args.mixins || args.superclass){
            const {Mix} = await import('./Mix.js');
            serviceClasses.mixer = Mix;
        }
        const {PropRegistry} = await import('./PropRegistry.js');
        serviceClasses.itemizer  = PropRegistry;
        const {PropSvc} = await import('./PropSvc.js');
        serviceClasses.propper = PropSvc;
        const config = args.config as WCConfig;
        if(config.actions !== undefined){
            const {Hookup} = await import('./Hookup.js');
            serviceClasses.hooker = Hookup;
        }
    }

    async #createServices(args: CEArgs){
        args.definer = this;
        const {servers} = args;
        args.services = {
            definer: this
        } as any as CEServices;
        for(const key in servers){
            (<any>args.services)[key] = new (<any>servers)[key](args);
        }
        this.dispatchEvent(new Event(mse))
        await this.#createClass(args);
    }


    async #createClass(args: CEArgs){
        const {services} = args;
        const {itemizer: createPropInfos, mixer: addMixins} = services!;
        await createPropInfos.resolve();
        const ext = addMixins?.ext || HTMLElement;
        const config = args.config as WCConfig;
        const {tagName, formAss} = config;
        const observedAttributes = await createPropInfos.getAttrNames(ext);
        class newClass extends (<any>ext){
            static is = tagName; 
            static observedAttributes = observedAttributes;
            static ceDef = args;
            static formAssociated = formAss;
            attributeChangedCallback(name: string, oldVal: string, newVal: string){
                if(super.attributeChangedCallback) super.attributeChangedCallback(name, oldVal, newVal);
                services!.definer.dispatchEvent(new CustomEvent(acb, {
                    detail: {
                        instance: this as any as HTMLElement,
                        name,
                        oldVal,
                        newVal,
                    }  as IAttrChgCB
                    
                }))
            }

            connectedCallback(){
                //console.log('connectedCallback');
                if(super.connectedCallback) super.connectedCallback();
                services!.definer.dispatchEvent(new CustomEvent(ccb, {
                    detail: {
                        instance: this as any as HTMLElement,
                    } as IConnectedCB
                }));
            }

            disconnectedCallback(){
                if(super.disconnectedCallback) super.disconnectedCallback();
                services!.definer.dispatchEvent(new CustomEvent(dcb, {
                    detail: {
                        instance: this as any as HTMLElement
                    } as IDisconnectedCB
                }));
            }
        }
        this.custElClass = newClass as any as {new(): HTMLElement}
        this.resolved = true;
        const {propper: addProps, hooker: connectActions} = services!;
        await addProps.resolve();
        //await connectActions?.resolve();
        
        def(newClass);
        
    }

    async #evalConfig(args: CEArgs){
        if(args === undefined) return;
        const {config} = args;
        if(typeof config != 'function') return;
        args.config = (await config()).default;
    }

    async resolveInstanceSvcs(args: CEArgs, instance: any){
        const {services} = args;
        const {InstSvc} = await import('./InstSvc.js');
        for(const svc of Object.values(services!)){
            if(svc instanceof InstSvc){
                await svc.instanceResolve(instance);
            }
        }

    }

}

export interface CE extends IDefine{}