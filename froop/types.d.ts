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
    asides?: any
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
    // /**
    //  * Side effects tied to actions, mostly used to load enhancement dependencies tied to 
    //  * enhancements
    //  */
    // asides?: Partial<{[key in keyof MixinCompositeActions & string]: (instance: EventTarget, methodName: string, key: string) => Promise<void> }>
}

export interface WCConfig<TProps = any, TActions = TProps, TPropInfo = PropInfo, TAction = Action>{
    tagName?: string;
    isEnh?: boolean;
    propDefaults?: Partial<{[key in keyof TProps]: TProps[key]}>;
    propInfo?: Partial<{[key in keyof TProps]: TPropInfo}>;
    derivedProps?: (keyof TProps & string)[];
    // actions?: 
    //     Partial<{[key in keyof MCActions & string]: TAction | keyof MCProps}> 
    actions?: Actions<TProps, TActions>;
    propChangeMethod?: keyof TActions;
    style?: Partial<CSSStyleDeclaration>;
    /**
     * Used for providing hints to server side processing what css queries should be observed if using HTMLRewriter.
     */
    keyQueries?: string[];
    formAss?: boolean;
    compacts?: Compacts<TProps>;
    
}

export type PropLookup<TProps = any> = Partial<{[key in keyof TProps]: PropInfo}>;

export interface OConfig<TProps = any, TActions = TProps, ETProps = TProps>{

    propDefaults?: Partial<{[key in keyof TProps]: TProps[key]}>;
    propInfo?: Partial<{[key in keyof TProps]: PropInfo}>;
    //onsets?: Onsets<TProps, TActions>;
    actions?: Actions<TProps, TActions>;
    /**
     * inferred actions
     */
    infractions?: Infractions<TProps>,
    compacts?: Compacts<TProps>;
    handlers?: Handlers<ETProps, TActions>;
    positractions?: Positractions<TProps, TActions>;
}

export type Positractions<TProps = any, TActions = TProps> = 
    | Array<Positraction<TProps, TActions>>;

export interface Positraction<TProps = any, TActions = TProps> extends LogicOp<TProps> {
    do: Function | (keyof TActions & string),
    ifKeyIn?: Array<keyof TProps & string>,
    ifAllOf?: Array<keyof TProps & string>,
    //ifNoneOf: Array<keyof TProps & string>,
    
    pass?: Array<(keyof TProps & string) | number | boolean | '$0' | `\`${string}\``>,
    assignTo?: Array<null | (keyof TProps & string)>
}



export type Compacts<TProps = any, TActions = TProps> = 
    //| Partial<{[key in `${keyof TProps & string}_to_${keyof TProps & string}` & string]: Operation<TProps> }>
    | Partial<{[key in `negate_${keyof TProps & string}_to_${keyof TProps & string}`]: number}>
    | Partial<{[key in `pass_length_of_${keyof TProps & string}_to_${keyof TProps & string}`]: number}>
    | Partial<{[key in `echo_${keyof TProps & string}_to_${keyof TProps & string}`]: number}>
    | Partial<{[key in `when_${keyof TProps & string}_changes_invoke_${keyof TActions & string}`]: number}>
    | Partial<{[key in `on_change_of_${keyof TProps & string}_toggle_${keyof TActions & string}`]: number}>
    | Partial<{[key in `when_${keyof TProps & string}_changes_inc_${keyof TProps & string}_by`]: number}>


export type Handlers<ETProps = any, TActions = ETProps> = 
    | Partial<{[key in `${keyof ETProps & string}_to_${keyof TActions & string}_on` & string]: string }>



export interface ICustomState<MCProps = any>{
    truthy?: string,
    falsy?: string,
    nameValue: string
}



export type ListOfLogicalExpressions<MCProps = any> = (keyof MCProps | LogicOp<MCProps>)[];

export type LogicOpProp<MCProps = any> = 
    |LogicOp<MCProps> | (keyof MCProps & string)[];

export interface LogicOp<Props = any>{
    /**
     * Supported by trans-render
     */
    ifAllOf?: Keysh<Props>,

    ifKeyIn?: Keysh<Props>,  

    ifNoneOf?: Keysh<Props>,

    ifEquals?: Array<Key<Props>>,

    ifAtLeastOneOf?: Keysh<Props>,

    debug?: boolean,

}

export interface SetLogicOps<Props = any>{

    a?: boolean,

    ifAllOf?: Set<Key<Props>>,

    ifKeyIn?: Set<Key<Props>>,  

    ifNoneOf?: Set<Key<Props>>,

    ifEquals?: Set<Key<Props>>,

    ifAtLeastOneOf?: Set<Key<Props>>,

    debug?: boolean,
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
    ro?: boolean;
    def?: any;
    attrName?: string;
    propName?: string;
    css?: ICustomState;
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

export type Actions<TProps = any, TActions = TProps> = 
    Partial<{[key in keyof TActions & string]: LogicOp<TProps>}>
    //& Partial<{[key in `do_${keyof TActions & string}_on`]: Key<TActions> | Array<Key<TActions>> }> 
;

export type Checks<TProps = any, TActions = TProps> = 
    Partial<{[key in keyof TActions & string]: SetLogicOps<TProps>}>

export type roundaboutOptions<TProps = any, TActions = TProps, ETProps = TProps> = {
    vm?: TProps & TActions & RoundaboutReady,
    propagate?: keyof TProps & string | Array<keyof TProps & string>,
    actions?: Actions<TProps,TActions>,
    compacts?: Compacts<TProps>,
    onsets?: Onsets<TProps, TActions>,
    handlers?: Handlers<ETProps, TActions>,
    positractions?: Positractions<TProps>
    //do?:  Partial<{[key in `${keyof TActions & string}_on`]: Keysh<TProps> }>
}

export type PropsToPartialProps<TProps = any> = 
 | ((self: TProps) => Promise<Partial<TProps>>) 
 | ((self: TProps) => Partial<TProps>);

export type Infractions<TProps = any> = 
    //| PropsToPartialProps<TProps> 
    | Array<PropsToPartialProps<TProps>> 



export type Busses = {[key: string]: Set<string>};

export type Routers = {[key: string]: Array<{
    on: string,
    do: string,
    full: string,
}>}

export type Key<T = any> = keyof T & string;

export type Keysh<T = any> = Key<T> | Array<Key<T>>;

export interface RoundaboutReady{
    /**
     * Allow for assigning to read only props via the "backdoor"
     * Bypasses getters / setters, sets directly to (private) memory slots
     * Doesn't do any notification
     * Allows for nested property setting
    */
    covertAssignment(obj: any): void;

    /**
     * fires event with name matching the name of the property when the value changes (but not via covertAssignment)
     * when property is set via public interface, not (immediately) via an action method's return object
     */
    readonly propagator : EventTarget | undefined;
}



export interface BaseProps{
    proppedUp: boolean,
}

export interface ICompact{
    compacts: Compacts,
    covertAssignment(obj: any, vm: RoundaboutReady, keysToPropagate: Set<string>, busses: Busses): Promise<void>,
}



