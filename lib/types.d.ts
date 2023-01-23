export interface RenderContextEndUserProps<T = Element, TItem = any>{
    shadowPeer?: Element | undefined;
    host?: any | undefined;
    hostController?: any;
    match?: Matches;
    make?: CSSSelectorBeHavingMap;

}

export interface BeHaving<TEndUserProps = any> {
    be: string,
    having: TEndUserProps | undefined,
}

export type CSSSelectorBeHavingMap = {[key: string]: BeHaving | BeHaving[]}

export interface Attachable{
    attach(target: Element): Promise<void>;
}

export interface RenderContext<T = Element, TItem = any> extends RenderContextEndUserProps<T, TItem>, getValArg {
    ctx?: RenderContext | undefined;
    transform?: (sourceOrTemplate: HTMLElement | DocumentFragment, ctx: RenderContext, target?: HTMLElement | DocumentFragment) => Promise<RenderContext<T>>;
    idx?: number;
    target?: T | null;
    targetProp?: string;
    options?: RenderOptions | undefined;
    attrib?: string | null;
    name?: string | null;
    val?: string | null;
    rhs?: any;
    key?: string;
    queryCache?: WeakMap<Element | DocumentFragment, {[key: string]: NodeListOf<Element>}>;
    abort?: boolean | undefined;
    // templateIds?: string[];
    queryInfo?: QueryInfo;
    timestampKey?: string;
    self?: Transformer;
    initiator?: Element;
    trace?: boolean;

}


export type matchTypes = 'parts'| 'part' | 'id' | 'classes' | 'class' | 'attribs' | 'attrib' | 'elements' | 'element' | 'names' | 'name' | 'props' | 'placeholders';

export interface QueryInfo{
    query: string;
    match: string;
    attrib?: string;
    lhsProp?: string;
    first?: boolean;
    verb?: string;
}

export interface RenderOptions{
    prepend?: boolean;
    
}


export interface PMDo{
    do(ctx: RenderContext): void;
}


export type PropSettings<T extends Partial<HTMLElement> = HTMLElement, HostProps = any> = {
    [P in keyof T]?: keyof HostProps;
};

export type EventSettings = {[key: string] : ((e: Event) => void) | string | INotify};

export interface IMinimalNotify{

    nudge?: boolean;

    debug?: boolean;

    eventListenerOptions?: boolean | AddEventListenerOptions | undefined;

    doInit?: boolean;
}

export interface IDIYNotify extends IMinimalNotify{
    doOnly?: (target: Element, key: string, mn: IMinimalNotify, e?: Event) => void;
}

export interface IValFromEventInstructions<TSelf = any, TProps = any, TActions = TProps> {
    /**
     * Hardcoded value to set on recipient element.
     */
     val?: any
    /**
     * path to get value from target
     */
    valFromTarget?: keyof TSelf;
    /**
     * path to get value from target
     */
    vft?: keyof TSelf | `${keyof TSelf & string}.${string}`;
    /**
     * path to get value from event
     */
    valFromEvent?: string;
    /**
     * path to get value from event
     */
    vfe?: string;

    propName?: string;

    clone?: boolean;

    parseValAs?: 'int' | 'float' | 'bool' | 'date' | 'truthy' | 'falsy' | undefined | 'string' | 'object';

    trueVal?: any;

    falseVal?: any;
}


export interface INotify<TSelf = any, TProps = any, TActions = TProps> extends  IMinimalNotify, IValFromEventInstructions<TSelf, TProps, TActions>{


    /**
     * Pass property or invoke fn onto custom or built-in element hosting the contents of p-u element.
     */
    //toHost: boolean;
    /**
     * Id of Dom Element.  Uses import-like syntax:
     * ./my-id searches for #my-id within ShadowDOM realm of  instance.
     * ../my-id searches for #my-id one ShadowDOM level up.
     * /my-id searches from outside any ShadowDOM.
     * @attr
     */
    toUpShadow?: string;

    /**
     * abbrev of toUpShadow
     */
    to?: string

    /**
     * Pass property or invoke fn onto itself
     */
    toSelf?: boolean;
    
    /**
     * Pass property to the nearest previous sibling / ancestor element matching this css pattern, using .previousElement(s)/.parentElement.matches method. 
     * Does not pass outside ShadowDOM realm.
     */
    toNearestUpMatch?: string;

    toClosest?: string;

    /**
     * to closest or host ("itemscope" attribute or shadow DOM boundary)
     */
    tocoho?: boolean | string; //to closest or host

    /**
     * Name of property to set on matching (upstream) element.
     * @attr
     */
    prop?: keyof TProps & string;

    /**
     * Name of method or property arrow function to invoke on matching (upstream) element.
     */
    fn?: keyof TActions & string;

    dispatch?: string;

    withArgs?: ('self' | 'val' | 'event')[];

    plusEq?: boolean | string | number;

    eqConst?: any;

    toggleProp?: boolean;



    as?: 'str-attr' | 'bool-attr' | 'obj-attr',

    


    thenDo?: (target: Element, key: string, n: INotify, e?: Event) => void;

    

}

export interface INotifyHookupInfo{
    controller: AbortController;
}

export interface IConditional<MCProps extends Partial<HTMLElement> = HTMLElement>{
    /**
     * Name of property to check if truthy
     */
    if?:  keyof MCProps;
    /**
     * If condition value
     */
    ifVal?: boolean;
    lhs?: string;
    lhsVal?: any;
    rhs?: string;
    rhsVal?: any;
    op?: '==' | '!=' | '>' | '<' | '>=' | '<=' | '===' | '!=='  | undefined;
}
export type AttribsSettings = { [key: string]: string | boolean | number | undefined | null | string[]};
export type PSettings<T extends Partial<HTMLElement> = HTMLElement, HostProps = any> = [PropSettings<T, HostProps> | undefined]; 
export type PESettings<T extends Partial<HTMLElement> = HTMLElement> = [props: PropSettings<T> | undefined, on: EventSettings | undefined];
export type PEUnionSettings<T extends Partial<HTMLElement> = HTMLElement> = PSettings<T> | PESettings<T>;
export type PEASettings<T extends Partial<HTMLElement> = HTMLElement> = 
    [props: PropSettings<T> | undefined, events: EventSettings | undefined, attribs: AttribsSettings | undefined];
export type PEAUnionSettings<T extends Partial<HTMLElement> = HTMLElement> = PEUnionSettings<T> | PEASettings<T>;
// export type PEATSettings<T extends Partial<HTMLElement> = HTMLElement> = 
//     [PropSettings<T> | undefined, EventSettings | undefined, AttribsSettings | undefined, TransformValueOptions<T> | undefined];
// export type PEAT$ettings<T extends Partial<HTMLElement> = HTMLElement> =
//     [PropSettings<T> | undefined, EventSettings | undefined, AttribsSettings | undefined, TransformValueOptions<T> | undefined, symbol]
// export type PEATUnionSettings<T extends Partial<HTMLElement> = HTMLElement> = 
//     PSettings<T> | PESettings<T> | PEASettings<T> | PEATSettings<T> | PEAT$ettings<T>;
export type ConditionalSettings<T extends Partial<HTMLElement> = HTMLElement> = 
    [boolean, IConditional<T>, ...any]


export interface TRElementProps {
    propChangeQueue?: Set<string>;
    inReflectMode?: boolean;

}

export interface TRElementActions{
    attachQR(): void;
    detachQR(): void;
    attributeChangedCallback?(n: string, ov: string, nv: string): void;
}



export interface DefineArgs<MixinCompositeProps = any, MixinCompositeActions = MixinCompositeProps, TPropInfo = PropInfo, TAction extends Action = Action<MixinCompositeProps>>{
    superclass?: {new(): HTMLElement} | string,
    mixins?: any[],
    mainTemplate?: HTMLTemplateElement;
    /** use this only for defaults that can't be JSON serialized in config */
    complexPropDefaults?: Partial<MixinCompositeProps>;
    /** Config should be 100% JSON serializable, or a JSON import, or an id of an be-exportable script tag */
    config: WCConfig<MixinCompositeProps, MixinCompositeActions, TPropInfo, TAction> | (() => Promise<{default: WCConfig<MixinCompositeProps, MixinCompositeActions, TPropInfo, TAction>}>) | string;
     
}

export interface WCConfig<MCProps = any, MCActions = MCProps, TPropInfo = PropInfo, TAction = Action>{
    tagName?: string;
    propDefaults?: Partial<{[key in keyof MCProps]: MCProps[key]}>;
    propInfo?: Partial<{[key in keyof MCProps]: TPropInfo}>
    derivedProps?: (keyof MCProps & string)[];
    actions?: Partial<{[key in keyof MCActions]: TAction | keyof MCProps}> 
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

    ifAtLeastOneOf?: LogicOpProp<MCProps>

}




export interface Transform<TMixinComposite = any> extends LogicOp<TMixinComposite>{
    match: {[key: string]: MatchRHS<TMixinComposite>}
}

export interface Action<MCProps = any, MCActions = MCProps> extends LogicOp<MCProps>{
    target?: keyof MCProps; 
    debug?: boolean;
    //setFree?: (keyof MCProps & string)[],
}

export type MatchRHS<TMixinComposite = any> = string;

type PropInfoTypes = "String" | "Number" | "Boolean" | "Object" | "RegExp";
export interface PropInfo{
    type?: PropInfoTypes;
    dry?: boolean;
    parse?: boolean;
}


export interface HasPropChangeQueue{
    propChangeQueue: Set<string> | undefined;
    QR: undefined | ((name: string, self: HasPropChangeQueue) => void);
}

export interface PropChangeInfo<TPropInfo = PropInfo> {
    key: string,
    ov: any,
    nv: any,
    prop: TPropInfo,
    pcm: PropChangeMethod | undefined;
}

export interface ProxyPropChangeInfo{
    oldValue: any,
    newVal: any,
    prop: string
}

export type PropChangeMoment = 'v' | '-a' | '+a' | '+qr' | '+qm';

export type PropChangeMethod = (self: EventTarget, pci: PropChangeInfo, moment: PropChangeMoment) => boolean;

export type RHS<MCProps extends Partial<HTMLElement> = HTMLElement> = 
    string | boolean 
    | PSettings<MCProps> | PESettings<MCProps> | PEASettings<MCProps> 
    | ConditionalSettings<MCProps>
    | {[key: string]: Matches}
;

export type Matches<MCProps extends Partial<HTMLElement> = HTMLElement> = {[key: string]: RHS<MCProps>};

export interface TransformPacket<MCProps extends Partial<HTMLElement> = HTMLElement> {
    hydratingTransform?: Matches;
    transform?: Matches<MCProps> | Matches<MCProps>[];
    make?: CSSSelectorBeHavingMap;
    unsafeTransform?: {[key: string]: (ctx: RenderContext) => any};
    DTRCtor?: any;
}

export interface TemplMgmtProps<MCProps extends Partial<HTMLElement> = HTMLElement> extends TransformPacket<MCProps>{
    mainTemplate?: HTMLTemplateElement | string;
    unsafeTCount: number;
    styles?: CSSStyleSheet[] | string;
    clonedTemplate?: Node | undefined;
    noshadow?: boolean;
    renderOptions?: RenderOptions;
    mntCnt?: number;
    
    homeInOn?: Partial<{[key in keyof MCProps]: TransformPacket}>;
}

export interface TemplMgmtActions{
    doTransforms(self: this): void;
    cloneTemplate(self: this): void;
}

export interface TemplMgmtBase extends HTMLElement, TemplMgmtProps, TemplMgmtActions{}

export interface Transformer{
    transform(fragment: Element | DocumentFragment | Element[], fragmentManager?: Element): Promise<RenderContext>;
    flushCache(): void;
    getDefaultProp(target: any): string;
    ctx: RenderContext;
}

export interface ITSChecker{
    notChanged(host: Element, fragment: Element | DocumentFragment): boolean;
}

export interface ITx{
    transform(): Promise<void>;
    match?: Matches;
    make?: CSSSelectorBeHavingMap;
    scope: Scope;
}

/**
 * Target selector in upward direction.
 */
export type Target = 
/**
* Use the parent element as the target
*/ 
'parent' | 
/**
* abbrev for parent
*/
'p' |
/**
 * Use the element itself as the target
 */ 
'self' | 
/**
 * abbrev for self
 */ 
's' |
/**
 * Use the native .closest() function to get the target
 */
['closest', string] |
/**
 * abbrev for closet
 */
['c', string] | 
/**
 * Find nearest previous sibling, parent, previous sibling of parent, etc that matches this string.
 */
['upSearch', string] |
/**
 * abbrev for upSearch
 */
['us', string] |
/**
 * If second element is true, then tries .closest('itemscope').  If string, tries .closest([string value])
 * If that comes out to null, do .getRootNode
 */
['closestOrHost', boolean | string] |
/**
 * abbrev for closestOrHost
 */
['coh', true | string] |
/**
 * get host
 */
'host' |
/**
 * abbrev for host
 */
'h'
;


/**
 * Outer boundary for transformation
 */
export type Scope = Target |
    /**
    * use native function getRootNode() to set the target
    *
    */ 
    'rootNode' | 
    /**
    * abbrev for rootNode
    */ 
    'rn' |
    /**
     * Similar to closestOrHost, but just get the root fragment via getRootNode()
     */
    ['closestOrRootNode', boolean | string] | 
    /**
     * abbrev for closestOrRootNode
     */
    ['corn', boolean | string] |

    'shadowDOM' | 
    /** 
     * abbrev for shadow DOM
     */
    'sd'

;

export interface getValArg {
    host?: any;
}

export interface IActionProcessor{
    doActions(self: IActionProcessor, actions: {[methodName: string]: Action}, target: any, proxy?: any): void;
    postHoc(self: this, action: Action, target: any, returnVal: any, proxy?: any): void;
}

export interface TransformIslet {
    transform: any,
    islet: (inp: any) => any,
    isletDependencies?: string[],
    transformDependencies?: Set<string>,
    transformer?: Transformer
}

export interface TransformJoinEvent {
    match?: Matches,
}



