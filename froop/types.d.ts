import {PropInfo, Action, DefineArgs, Scope, Matches} from '../lib/types';

export interface IEventConfig<MCProps = any, MCActions = MCProps, TAction = Action>{
    on: string,
    of: EventTarget,
    doInit?: boolean,
}

export type ActionOnEventConfigs<MCProps = any, MCActions = MCProps, TAction = Action> = Partial<{[key in keyof MCActions]: IEventConfig<MCProps, MCActions, TAction>}>

export interface IPropagator extends EventTarget{
    get(key: string): any;
    set(key: string, val: any): void;
    /**
     * Delta Keys
     */
    dk: Set<string>;

    /**
     * timeout handles - key is name of prop
     * used for simple debouncing of echo notifications in XtalElement
     */
    eth: Map<string, string | number | NodeJS.Timeout> | undefined; 

    /**
     * timeout handles - key is name of prop
     * used for simple debouncing of toggle echo notifications in XtalElement
     */
    tth:  Map<string, string | number | NodeJS.Timeout> | undefined;
}

export interface IResolvableService extends EventTarget{
    resolved: boolean;
    resolve(): Promise<void>;
    
}

export interface IInstanceResolvableService<T extends object = object> extends IResolvableService{
    instanceResolve(instance: T): Promise<void>;
}

export interface IMix extends IResolvableService{
    ext: {new(): HTMLElement}
}

export interface IPropRegistrar extends IResolvableService{
    propInfos: {[key: string]: PropInfo},
    allPropNames: string[],
    getAttrNames(ext: any): Promise<string[]>,
    getPropsFromAction(action: string | Action): Set<string>,
    nonDryProps: Set<string>,
}

export interface IDefine extends IResolvableService{
    custElClass: {new(): HTMLElement};
    resolveInstanceSvcs(args: CEArgs, instance: any): Promise<void>;
}

export interface IPropSvc extends IResolvableService{

}

export interface IHookup extends IInstanceResolvableService{

}

export interface IAttrChgCB{
    instance: HTMLElement,
    name: string,
    oldVal: string,
    newVal: string,
}

export interface IConnectedCB{
    instance: HTMLElement,
}

export interface IPropChg{
    key: string,
    oldVal: any,
    newVal: any,
    
}

export interface IDisconnectedCB {
    instance: HTMLElement
}

export interface INewPropagator {
    instance: HTMLElement,
    propagator: IPropagator,
}

export interface CEServiceClasses {
    mixer?: {new(args: CEArgs): IMix},
    itemizer?: {new(args: CEArgs): IPropRegistrar},
    propper?: {new(args: CEArgs): IPropSvc},
    hooker?: {new(args: CEArgs): IHookup},
}

export interface CEServices {
    mixer?: IMix,
    itemizer: IPropRegistrar,
    propper: IPropSvc,
    definer: IDefine,
    hooker?: IHookup,
}

export interface CEArgs<TProps = any, TActions = TProps, TPropInfo = PropInfo, TAction extends Action<TProps> = Action<TProps>> extends DefineArgs<TProps, TActions, TPropInfo, TAction>{
    definer?: IDefine,
    servers?: CEServiceClasses
    services?: CEServices,
}

export interface DynamicTransform {
    scope: Scope,
    match: Matches,
    noCache: boolean,
}

export interface IPE {
    do(instance: EventTarget, originMethodName: string, vals: [any, ActionOnEventConfigs] ): Promise<void>,
}

export interface IPET extends IPE{
    re(instance: EventTarget, originMethodName: string, vals: [any, ActionOnEventConfigs, DynamicTransform] ): Promise<void>,
}