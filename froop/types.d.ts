import { Scope} from '../lib/types';

export interface IEventConfig<MCProps = any, MCActions = MCProps, TAction = Action>{
    on?: string,
    of?: 'tbd' | EventTarget,
    doInit?: boolean,
    options?: AddEventListenerOptions,
    abort?: {
        origMethName: string & keyof MCActions,
        //destMethName: string & keyof MCActions,
        of: 'tbd' | EventTarget,
        on: string, 
        
    },
    composedPathMatches?: string,
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
     * Mature keys
     */
    mk: Set<string>;

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
    createPropBag(instance: Element): void;
}

export interface IHookup extends IInstanceResolvableService{

}

export interface IAttrChgCB{
    instance: HTMLElement,
    // name: string,
    // oldVal: string,
    // newVal: string,
    newAttrs: {[key: string]: {oldVal: string | null, newVal: string | null}},
    filteredAttrs: {[key: string]: string}
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
    scope?: Scope,
    noCache?: boolean,
}

export interface IPE {
    do(instance: EventTarget, originMethodName: string, vals: [any, ActionOnEventConfigs] ): Promise<void>,
}

export interface IPET extends IPE{
    re(instance: EventTarget, originMethodName: string, vals: [any, ActionOnEventConfigs, DynamicTransform] ): Promise<void>,
}

export interface DefineArgs<MixinCompositeProps = any, MixinCompositeActions = MixinCompositeProps, TPropInfo = PropInfo, TAction extends Action = Action<MixinCompositeProps>>{
    superclass?: {new(): HTMLElement} | string,
    mixins?: any[],
    mainTemplate?: HTMLTemplateElement;
    /** use this only for defaults that can't be JSON serialized in config */
    complexPropDefaults?: Partial<MixinCompositeProps>;
    /** Config should be 100% JSON serializable, or a JSON import, or an id of an be-exportable script tag */
    config: WCConfig<MixinCompositeProps, MixinCompositeActions, TPropInfo, TAction> | (() => Promise<{default: WCConfig<MixinCompositeProps, MixinCompositeActions, TPropInfo, TAction>}>) | string;
    /**
     * Side effects tied to actions, mostly used to load enhancement dependencies tied to 
     * enhancements
     */
    asides?: Partial<{[key in keyof MixinCompositeActions & string]: (instance: EventTarget, methodName: string, key: string) => Promise<void> }>
}

export interface WCConfig<MCProps = any, MCActions = MCProps, TPropInfo = PropInfo, TAction = Action>{
    tagName?: string;
    isEnh?: boolean;
    propDefaults?: Partial<{[key in keyof MCProps]: MCProps[key]}>;
    propInfo?: Partial<{[key in keyof MCProps]: TPropInfo}>
    derivedProps?: (keyof MCProps & string)[];
    actions?: Partial<{[key in keyof MCActions & string]: TAction | keyof MCProps}> 
    propChangeMethod?: keyof MCActions;
    style?: Partial<CSSStyleDeclaration>;
    /**
     * Used for providing hints to server side processing what css queries should be observed if using HTMLRewriter.
     */
    keyQueries?: string[];
    formAss?: boolean;
}

export type ListOfLogicalExpressions<MCProps = any> = (keyof MCProps | LogicOp<MCProps>)[];

export type LogicOpProp<MCProps = any> = LogicOp<MCProps> | (keyof MCProps | LogicOp<MCProps>)[];

export interface LogicOp<MCProps = any>{
    /**
     * Supported by trans-render
     */
    ifAllOf?: LogicOpProp<MCProps>,

    ifKeyIn?: (keyof MCProps & string)[],  

    ifNoneOf?: LogicOpProp<MCProps>,

    ifEquals?: LogicOpProp<MCProps>,

    ifAtLeastOneOf?: LogicOpProp<MCProps>,



}

export interface Action<MCProps = any, MCActions = MCProps> extends LogicOp<MCProps>{
    target?: keyof MCProps; 
    debug?: boolean;
    secondArg?: any;
    //setFree?: (keyof MCProps & string)[],
}

export interface IActionProcessor{
    doActions(self: IActionProcessor, actions: {[methodName: string]: Action}, target: any, proxy?: any): void;
    postHoc(self: this, action: Action, target: any, returnVal: any, proxy?: any): void;
}

type PropInfoTypes = "String" | "Number" | "Boolean" | "Object" | "RegExp";
export interface PropInfo{
    type?: PropInfoTypes;
    dry?: boolean;
    parse?: boolean;
}

export type ConstString = String;

export type NameOfProp = string;

export type StringOrProp = ConstString | [NameOfProp, PropInfo];

export type Parts = Array<StringOrProp>;

export interface PropChangeInfo<TPropInfo = PropInfo> {
    key: string,
    ov: any,
    nv: any,
    prop: TPropInfo,
    pcm: PropChangeMethod | undefined;
}

//are these still really used?
export type PropChangeMoment = 'v' | '-a' | '+a' | '+qr' | '+qm';

export type PropChangeMethod = (self: EventTarget, pci: PropChangeInfo, moment: PropChangeMoment) => boolean;

export type roundaboutOptions<TProps = any, TActions = TProps> = {
    propagate: keyof TProps & string | Array<keyof TProps & string>,
    actions?: 
        | Partial<{[key in keyof TActions & string]: any}>
        | Partial<{[key in `do_${keyof TActions & string}_on`]: Key<TActions> | Array<Key<TActions>> }> 
}

export type Key<T = any> = keyof T & string;

