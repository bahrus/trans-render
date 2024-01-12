import { DefineArgs, LogicOp, PropInfo, HasPropChangeQueue, Action, PropInfoTypes, PropChangeInfo, PropChangeMoment, ListOfLogicalExpressions, TRElementProps, PropChangeMethod, TRElementActions, WCConfig, IActionProcessor } from '../lib/types.js';
export { Action, PropInfo, TRElementActions, TRElementProps, WCConfig, IActionProcessor as IHasPostHoc} from '../lib/types.js';
export {ActionOnEventConfigs} from '../froop/types';
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
        if(args.servers === undefined) args.servers = {};
        const {servers: serviceClasses} = args;
        if(args.mixins || args.superclass){
            const {Mix} = await import('./Mix.js');
            serviceClasses.mixer = Mix;
        }
        const {PropRegistry} = await import('./PropRegistry.js');
        serviceClasses.itemizer  = PropRegistry;
        const {PropSvc} = await import('./PropSvc.js');
        serviceClasses.propper = PropSvc;
        const {config} = args;
        const {actions, propDefaults} = config as WCConfig;
        //const config = args.config as WCConfig;
        if(actions || propDefaults){
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
        const {itemizer, mixer} = services!;
        await itemizer.resolve();
        const ext = mixer?.ext || HTMLElement;
        const config = args.config as WCConfig;
        const {tagName, formAss, isEnh} = config;
        const observedAttributes = isEnh ? undefined :  await itemizer.getAttrNames(ext);
        class newClass extends (<any>ext){
            static is = tagName; 
            static observedAttributes = observedAttributes;
            static ceDef = args;
            static formAssociated = formAss;
            constructor(){
                super();
                if(this.attachInternals !== undefined && !isEnh){
                    this._internals_ = this.attachInternals(); //Safari 16.4 doesn't yet support
                }
                
            }
            #newAttrs: {[key: string]: {oldVal: string | null, newVal: string | null}} = {};
            #filteredAttrs: {[key: string]: string | null} = {};
            attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null){
                if(super.attributeChangedCallback) super.attributeChangedCallback(name, oldVal, newVal);
                const newAttrs = this.#newAttrs;
                const filteredAttrs = this.#filteredAttrs;
                newAttrs[name] = {oldVal, newVal};
                if(newVal === null){
                    delete filteredAttrs[name];
                }else{
                    filteredAttrs[name] =newVal;
                }
                //TODO:  optimize this
                if(Array.from((this as any as Element).attributes).filter(x => observedAttributes?.includes(x.name)).length === Object.keys(filteredAttrs).length){
                    services!.definer.dispatchEvent(new CustomEvent(acb, {
                        detail: {
                            instance: this as any as HTMLElement,
                            newAttrs,
                            filteredAttrs
                        }  as IAttrChgCB
                        
                    }));
                    this.#newAttrs = {};
                }else{
                    this.isAttrParsed = false;
                }
                

            }

            async connectedCallback(){
                //console.debug('connectedCallback');
                if(super.connectedCallback) super.connectedCallback();
                const dh = 'defer-hydration';
                if(!isEnh){
                    if((this as any as HTMLElement).hasAttribute(dh)){
                        const {wfac} = await import('../lib/wfac.js');
                        await wfac(this as any as HTMLElement, dh, (s: string | null) => s === null);
                    }
                    if(this.attributes.length === 0){
                        this.isAttrParsed = true;
                    }
                }
                //console.log({propper: services?.propper, createPropBag: services?.propper.createPropBag});
                //services?.propper.createPropBag(this as any as HTMLElement);
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
        const {propper, /*hooker: connectActions*/} = services!;
        await propper.resolve();
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