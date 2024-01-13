import {RHS, ToTransformer} from '../types';


export type matchTypes = 'parts'| 'part' | 'id' | 'classes' | 'class' | 'attribs' | 'attrib' | 'elements' | 'element' | 'names' | 'name' | 'props' | 'placeholders';

export interface QueryInfo{
    query: string;
    match: string;
    attrib?: string;
    lhsProp?: string;
    first?: boolean;
    verb?: string;
    havingAlso?: QueryInfo[];
    havingInner?: QueryInfo;
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

    navTo?: string;

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




export interface Transform<TMixinComposite = any> extends LogicOp<TMixinComposite>{
    match: {[key: string]: MatchRHS<TMixinComposite>}
}

export interface Action<MCProps = any, MCActions = MCProps> extends LogicOp<MCProps>{
    target?: keyof MCProps; 
    debug?: boolean;
    secondArg?: any;
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
    oldVal: any,
    newVal: any,
    prop: string
}

export type PropChangeMoment = 'v' | '-a' | '+a' | '+qr' | '+qm';

export type PropChangeMethod = (self: EventTarget, pci: PropChangeInfo, moment: PropChangeMoment) => boolean;




export interface ITSChecker{
    notChanged(host: Element, fragment: Element | DocumentFragment): boolean;
}



export type TargetTuple = 
      /**
      * Use the native .closest() function to get the target
      */
    | ['closest', string] 
     /**
     * abbrev for closet
     */
    | ['c', string] 
     /**
     * Find nearest previous sibling, parent, previous sibling of parent, etc that matches this string.
     */
    | ['upSearch', string] 
     /**
     * abbrev for upSearch
     */
    | ['us', string] 
     /**
     * Tries .closest([string value]).
     * If that comes out to null, do .getRootNode().host
     */
    | ['closestOrHost', string]
     /**
     * abbrev for closestOrHost
     */
    | ['coh', string]
     /**
      * Find nearest previous element sibling that matches this string
      */
    | ['previous', string]
    /**
     * Find first element matching string within root node.
     */
    | ['withinRootNode', string]
    /**
     * abbrev for withinRootNode
     */
    | ['wrn', string]
    /**
     * Find first element matching string within itemscope.
     */
    | ['withinItemScope', string]
    /**
     * abbrev for within item scope
     */
    | ['wis', string]
    /**
     * First first element matching string within form.
     */
    | ['withinForm', string]
    /**
     * abbrev for within form
     */
    | ['wf', string]

;
/**
 * Target selector in upward direction.
 */
export type Target = 
| TargetTuple 
  /**
  * Use the parent element as the target
  */ 
| 'parent'
  /**
  * abbrev for parent
  */
| 'p' 
  /**
  * Use the previous element sibling as the target.
  */
| 'previousElementSibling' 
  /**
  * abbrev for previous element sibling.
  */
| 'pes' 
  /** 
   * Search previous element siblings for target that matches the query.
   */
| `previous${camelQry}` |

/**
 * Use the parent as the target.  If no parent, use root node.
 */
'parentOrRootNode' |
/**
 * abbrev for parent or root node
 */
'porn' |
/**
 * Do "closest" for element with "-"" in the name.  If non found, get host of getRootNode()
 */
'hostish' |
/**
 * Use the element itself as the target
 */ 
'self' | 
/**
 * abbrev for self
 */ 
's' |
`closest${camelQry}` |

/**
 * [TODO]
 * do upsearch for matching itemref
 */
'nearestScope' |

 
/**
 * Find nearest previous sibling, parent, previous sibling of parent, etc that matches this string.
 */
`upSearchFor${camelQry}` |



/**
 * Tries .closest matching string.  If that's null, does .getRootNode().host
 */
`closest${camelQry}OrHost` |

/**
 * Searches for first element within the rootNode that matches the camelQry.
 */
`${camelQry}WithinRootNode` |


/**
 * get host
 */
'host' |
/**
 * abbrev for host
 */
'h'
;

export type ScopeTuple = TargetTuple
      /**
      * Similar to closestOrHost, but just get the root fragment via getRootNode()
      */
    | ['closestOrRootNode', string] 
      /**
      * abbrev for closestOrRootNode
      */
    | ['corn', string]
;
/**
 * Outer boundary for transformation
 */
export type Scope = Target | ScopeTuple |
    /**
    * use native function getRootNode() to set the target
    *
    */ 
    'rootNode' | 
    /**
    * abbrev for rootNode
    */ 
    'rn' |
    `closest${camelQry}OrRootNode` | 


    'shadowDOM' | 
    /** 
     * abbrev for shadow DOM
     */
    'sd'

;

//https://stackoverflow.com/questions/38123222/proper-way-to-declare-json-object-in-typescript
type JSONValue = 
 | string
 | number
 | boolean
 | null
 | JSONValue[]
 | {[key: string]: JSONValue}

interface JSONObject {
  [k: string]: JSONValue
}
interface JSONArray extends Array<JSONValue> {}

export interface getValArg {
    host?: any;
}

export interface IActionProcessor{
    doActions(self: IActionProcessor, actions: {[methodName: string]: Action}, target: any, proxy?: any): void;
    postHoc(self: this, action: Action, target: any, returnVal: any, proxy?: any): void;
}


//export type AffectOptions = 'host' | 'beScoped' | '$' | '$.beScoped' | `.${string}`;



export type keyOfCtxNavElement = keyof ICTXNavElement & string;

export type keyofICTXCamelQryPrompt = `${keyof ICTXCamelQryPrompt & string}.${camelQry}`;

export type keyofCTXNavRecursive = (keyof ICTXNavRecursive & string) |  keyofICTXCamelQryPrompt;



export type AffectOptions = 
      `${keyOfCtxNavElement}`
    | `${keyofCTXNavRecursive}`
    | `${keyofCTXNavRecursive}.${keyofCTXNavRecursive}`
    //| `${keyofCTXNavRecursive}.${keyofCTXNavRecursive}.${keyofCTXNavRecursive}`
    // |  `${keyofCTXNavRecursive}.${keyofCTXNavRecursive}.${keyofCTXNavRecursive}.${keyofCTXNavRecursive}`

;

// export interface HydrateAction {
//     affect?: AffectOptions,
//     set?: SetTransform,
//     inc?: string | IncTransform,
//     toggle: string | ToggleTransform,
//     /**
//      * method on affected entity
//      * pass in affected entity, event object
//      */
//     invoke: string,
//     /**
//      * export function defined from script tag
//      * pass in affected entity, event object
//      */
//     handler: string,
// }

// export type MethodParam = 'event' | 'invokee' | 'invoker' 

// export interface SetTransform {
//     eq: [lhs: string, rhs: string | string [] | JSONObject],
//     affect?: AffectOptions,
// }

// export interface IncTransform {
//     inc: [lhs: string, rhs: string | number],
//     affect?: AffectOptions,
// }

// export interface ToggleTransform {
//     prop: string,
//     affect?: AffectOptions,
// }

// export interface InvokeTransform {
//     method: string,
//     params?: MethodParam[],
//     affect?: AffectOptions,
// }


// export interface HydrateOptions {
//     onSet?: string,
//     /**
//      * EventName to CSS Query to select event to listen for and  element to observe 
//      * 
//      * */
//     [key: `on${string}Of`]: string,
//     /**
//      * Select the target to affect
//      */
//     affect?: AffectOptions,
//     do: HydrateAction[]
// }

// export interface IsletEndUserProps {
//     debug?: boolean,
//     transform?: Matches,
//     //hydrate : string | HydrateOptions | HydrateOptions[],
//     hydratingTransform?: Matches,
//     /**
//      * If not specified, will default to .
//      * 
//      */
//     observe?: 'beScoped' | 'xtalState' | '.',
//     /**
//      * Defaults to beScoped
//      */
//     of?: '.' | 'host' | 'beScoped',
//     /**
//      * CtxNav query to specify the **default** target which will be affected during event handling.
//      * There are many opportunities to override this default.
//      * If not specified, will default to host.
//      * 
//     **/
//     affect?: AffectOptions,
// }
// export interface Islet extends IsletEndUserProps {
    
//     islet: (inp: any, ctxNav: ICtxNav) => any,
//     isletDependencies?: string[],
//     transformDependencies?: Set<string>,
//     transformer?: Transformer
// }

// export interface TransformJoinEvent {
//     match?: Matches,
//     acknowledged?: boolean,
// }

export interface ICTXNavRecursive<T = any>{
    $?: T;
    hostCtx?: T;
}

/**
 * E = element
 * P = part
 * C = class
 * I = itemscope
 * A = attribute
 * N = name
 */
export type camelQry = `${string}E` | `${string}P` | `${string}C` | `${string}Id` | `${string}I` | `${string}A` | `${string}N` | `${string}M`;

export interface ExpectedCamelQry<T = any>{
    [key: camelQry] : ICtxNav<T>
}

export interface ICTXNavElement{
    self?: Element;
    host?: Element;
}

export interface ICTXCamelQryPrompt<T = any>{
    ancestor?: ExpectedCamelQry<T>;
    elder?: ExpectedCamelQry<T>;
}

export interface ICtxNav<T = any> extends ICTXNavRecursive<T>, ICTXNavElement, ICTXCamelQryPrompt<T> {
    beScoped?: EventTarget;

    xtalState(): Promise<EventTarget | undefined>;
}

export type ConstString = String;

export type NameOfProp = string;

export type StringOrProp = ConstString | [NameOfProp, PropInfo];

export type Parts = Array<StringOrProp>;



