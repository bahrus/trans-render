import { MountContext, PipelineStage } from "mount-observer/types";
import { ConvertOptions, Scope } from "./lib/types";


export type PropAttrQueryType = 
    | '|' //microdata itemprop
    | '@' //form element name
    | '#' //id
    | '%' //part
    | '.' //class
    //| '-' //marker
    | '$' //microdata itemprop + itemscope attributes (nested)
    | '-o'

export type PropAttrPair<TProps> = `${PropAttrQueryType} ${keyof TProps & string}`;

export type PropQueryExpression<TProps, TElement = {}> =
    
    | `* ${CSSQuery}`
    | `:root`
    | `${keyof HTMLElementTagNameMap}`
    | `${PropAttrPair<TProps>}`
    | `${PropAttrPair<TProps>} -s ${keyof TElement & string}`
    | `${PropAttrPair<TProps>} ${PropAttrPair<TProps>}`
    | `${PropAttrPair<TProps>} ${PropAttrPair<TProps>} -s ${keyof TElement & string}`
    // | `${PropAttrPair<TProps>} ${PropAttrPair<TProps>} ${PropAttrPair<TProps>}`
    // | `${PropAttrPair<TProps>} ${PropAttrPair<TProps>} ${PropAttrPair<TProps>} -s ${keyof TElement & string}`
    //
    
;

//#region derived expressions
export type Expr0 = [string, number];
export type Expr1 = [...Expr0, string];
export type Expr2 = [...Expr1, number];
export type Expr3 = [...Expr2, string];
export type Expr4 = [...Expr3, number];
export type Expr5 = [...Expr4, string];
export type Expr6 = [...Expr5, number];
export type Expr7 = [...Expr6, string];
export type Expr8 = [...Expr7, number];
export type Expr9 = [...Expr8, string];
export type Expr10 = [...Expr9, number];
export type Expr11 = [...Expr10, string];
export type Expr12 = [...Expr11, number];

//export type Action<TProps> = (matchingElement: Element, pique: IMountOrchestrator<TProps>) => Promise<Derivative<TProps>> | Promise<void>;
export type InterpolatingExpression = Expr0 | Expr1 | Expr2 | Expr3 | Expr4 | Expr5 | Expr6 | Expr7 | Expr8 | Expr9 | Expr10 | Expr11 | Expr12;
export type NumberExpression = [number];
export type DerivationCriteria<TProps, TMethods> = {
    //TODO
    path: string,
    from?: number,
    //TODO
    as?: ConvertOptions 
};

export interface TransformOptions{
    propagator?: MarkedUpEventTarget,
    skipInit?: boolean,
}

export type Derivative<TProps, TMethods, TElement = {}> = 
    | number 
    | InterpolatingExpression 
    | ((model: TProps & TMethods, transform: ITransformer<TProps, TMethods, TElement>, uow: UnitOfWork<TProps, TMethods, TElement>, matchingElement: Element) => any)
    | NumberExpression 
    | DerivationCriteria<TProps, TMethods>
    // only works if lhs has field/property
    | keyof TMethods & string 
    // combined observe an 0
    | keyof TProps & string
    | boolean
;
//#endregion

export interface Engagement<TMethods>{
    /** Invoked when the element is encountered. */
    do?: keyof TMethods & string,
    /** Invoked when a previously matching element is no longer matching. */
    undo?: keyof TMethods & string,
    /** Invoked when a previously matching element is disconnected. */
    forget?: keyof TMethods & string,
    /**
     * Can be used for any kind of label, but most common use is for specifying a behavior/enhancement
     * to attach.
     */
    be?: string,
    with?: any,
    waitForResolved?: boolean,
    dep?: () => void;


}


export type onMountStatusChange = 'onMount' | 'onDismount' | 'onDisconnect';

export interface EngagementCtx<TModel> {
    be?: string,
    with?: any,
    type: onMountStatusChange,
    mountContext: MountContext
}

export type EngagementOrKey<TMethods> = (keyof TMethods & string) | Engagement<TMethods>;

export type Engagements<TMethods> = 
    | EngagementOrKey<TMethods>
    | Array<EngagementOrKey<TMethods>>
;

export interface IMountOrchestrator<TProps, TMethods = TProps>{
    //TODO add all the methods
}

// export type OneOrMore<TProps> = 
//     | keyof TProps & string
//     | `${keyof TProps & string} ${keyof TProps & string}`




export type LHS<TProps, TElement={}> = PropQueryExpression<TProps, TElement>;

export type CSSQuery = string;

export interface ConditionGate<TProps, TMethods, TElement = {}>{
    ifAllOf?: number[],
    ifNoneOf?: number[],
    ifEqual?: [number, number | [number] | string],
    d?: Derivative<TProps, TMethods, TElement>,

}

export type WhereConditions = 
    | string //css matches
    | {
        matches: string,
        mediaMatches: string,
        containerQuery: string,
    }

export type IfInstructions<TProps, TMethods, TElement = {}> = string | boolean | number | [number] | ConditionGate<TProps, TMethods, TElement> ;

export interface ObservePropParams {
    derivePropFrom?: string,
}
export type PropOrComputedProp<TProps, TMethods = TProps> = 
    | keyof TProps & string
    | [keyof TProps & string, (val: any) => any]
    | [keyof TProps & string, keyof TMethods & string]
    | ObservePropParams
    | `:${string}`

export interface CrossProduct<TProps, TMethods> {
    x: string | Array<string>,
    y: (keyof TProps & TMethods & string) | Array<keyof TProps & TMethods & string>
}
export interface UnitOfWork<TProps, TMethods = TProps, TElement = {}>{
    /**
     * add event listener
     */
    a?:  AddEventListenerType<TProps, TMethods> | Array<AddEventListenerType<TProps, TMethods>>,

    /**
     * derived value from observed props
     */
    d?: Derivative<TProps, TMethods, TElement>,

    /**
     * enhance / engage with element, or register the found element in some way
     */
    e?:  Engagements<TMethods>,

    //forEachComboIn?: CrossProduct<TProps, TMethods> | Array<CrossProduct<TProps, TMethods>>

    /**
     * ifs ands or buts -- conditions on the model
     */
    i?: IfInstructions<TProps, TMethods, TElement>,

    /**
     * method of matching element to pass derived value into
     * [TODO]
     */
    invoke?: string,

    /**
     * modify the host in a (mostly) declarative  way
     */
    m?: ModificationUnitOfWork<TProps, TMethods, TElement> | Array<ModificationUnitOfWork<TProps, TMethods, TElement>>,

    /**
     * observed props
     */
    o?: keyof TProps & string | PropOrComputedProp<TProps, TMethods> | PropOrComputedProp<TProps, TMethods>[],

    /**
     * set specified property of the matching element to the (derived) value
     */
    s?: (keyof TElement & string) | {},
    /**
     * set specified attribute of the matching element to the (derived) value 
     */
    sa?: string,
    /**
     * set specified style of the matching element to the (derived) value
     */
    ss?: string,

    /**
     * 
     */
    w?: WhereConditions

    bindsTo?: keyof TElement & string,

}

export type ValueFromElement<TProps, TMethods, TElement = {}> = 
    (
        matchingElement: Element, 
        transformer: ITransformer<TProps, TMethods, TElement>, 
        mod: ModificationUnitOfWork<TProps, TMethods, TElement>
    ) => any

export interface ModificationUnitOfWork<TProps, TMethods, TElement = {}>{
    on: string,
    /**
     * Increment
     */
    inc?: keyof TProps & string,
    /**
     * Increment by specified number, or by specified property coming from matching element
     */
    byAmt?: number | string,
    /**
     * Set this prop on the host
     */
    s?: keyof TProps & string,
    /**
     * [TODO] -- Set Custom State --only available for xtal-element
     */
    ss?: string,
    /**
     * [TODO] -- Set attribute
     */
    sa?: string,
    /**
     * [TODO] enhance / engage the host, or register the host in some way
     * don't implement this until a good use case is found, make sure it makes sense.
     */
    e?:  Engagements<TMethods>,
    /**
     * [TODO]  Set hardcoded value
     */
    to?: any,
    toValFrom?: string | ValueFromElement<TProps, TMethods, TElement>;
    toggle?: keyof TProps & string,
}

export interface QuenitOfWork<TProps, TMethods, TElement = {}> extends UnitOfWork<TProps, TMethods, TElement>{
    q: string,
    qi?: QueryInfo,
}

export type UnitOfWorkRHS<TProps, TMethods, TElement = {}> = 
    | 0 
    | keyof TMethods & string 
    | keyof TProps & string
    | UnitOfWork<TProps, TMethods, TElement>
    | XForm<any, any, any> //unclear if this is necessary
;

export type RHS<TProps, TMethods, TElements = Element> = UnitOfWorkRHS<TProps, TMethods, TElements> | Array<UnitOfWork<TProps, TMethods, TElements>>;


export interface QueryInfo{
    isRootQry?: boolean,
    localPropCamelCase?: string,
    cssQuery?: string,
    o?: string[],
    s?: string[],
    localName?: string,
    //w?: WhereConditions,
    css?: string,
    hostPropToAttrMap?: Array<{type: PropAttrQueryType, name: string}>
}

export type TransformerTarget = Element | DocumentFragment | Element[] | ShadowRoot | Document;

export type Model = {
    [key: string]: any
}

export type EventListenerAction<TProps, TMethods> = (keyof TMethods & string) | ((e: Event, t: ITransformer<TProps, TMethods>, uow: UnitOfWork<TProps, TMethods>) => void);

export type AddEventListenerType<TProps, TMethods> =
    | keyof TMethods & string 
    | AddEventListener<TProps, TMethods>;

export interface AddEventListener<TProps, TMethods>{
    on: string,
    do: EventListenerAction<TProps, TMethods>,
    options?: boolean | EventListenerOptions, 
}

//export type XForm<TProps, TMethods> = Partial<{[key: string]: RHS<TProps, TMethods>}>
export type XForm<TProps, TMethods, TElement = {}> = Partial<{
    [key in LHS<TProps, TElement>]: RHS<TProps, TMethods, TElement>;
}>;

export interface Info  {
    411?: {
        w?: string,
    }
}



export interface ITransformer<TProps, TMethods, TElement = {}>{
    target: TransformerTarget,
    model: TProps & TMethods,
    xform: XForm<TProps, TMethods, TElement> & Info,
    options: TransformOptions,
    //propagator?: EventTarget,
}

export type ToTransformer<TProps, TMethods, TElement = {}> = (
    target: TransformerTarget, 
    model: TProps & TMethods,
    xform: XForm<TProps, TMethods, TElement>,
    propagator?: EventTarget
) => ITransformer<TProps, TMethods>;

export interface MarkedUpEventTarget extends EventTarget{
    ___props?: Set<string>;
    ___nestedProps?: Map<string, any>;
}

export interface TransRenderEndUserProps<ModelProps, ModelMethods = ModelProps, TElement = {}>{
    xform: XForm<ModelProps, ModelMethods, TElement>;
    scope: Scope;
    //model?: ModelProps & ModelMethods;
    options?: TransformOptions;
}

export interface TransRenderProps<ModelProps, ModelMethods = ModelProps> extends TransRenderEndUserProps<ModelProps, ModelMethods>{
    
}

export interface TransRenderMethods{
    getTarget(): Promise<Document | ShadowRoot | DocumentFragment | Element>,
    getXForm(): Promise<XForm<any, any>>,
    getModel(): Promise<any>,
    skipInit: boolean,
}