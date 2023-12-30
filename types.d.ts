import { MountContext, PipelineStage } from "mount-observer/types";

export type PropAttrQueryType = 
    | '|' //microdata itemprop
    | '@' //form element name
    | '#' //id
    | '%' //part
    | '.' //class
    | '-' //marker
    | '$' //microdata itemprop + itemscope attributes (nested)

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
export type ObjectExpression<TProps, TMethods> = {
    [key: string]: Derivative<TProps, TMethods>;
};

export type Derivative<TProps, TMethods> = 
    | number 
    | InterpolatingExpression 
    | ((model: TProps & TMethods, transform: ITransformer<TProps, TMethods>, uow: UnitOfWork<TProps, TMethods>, matchingElement: Element) => any)
    | NumberExpression 
    | ObjectExpression<TProps, TMethods>
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
    with?: any
}

//export interface EscalateProp

export type onMountStatusChange = 'onMount' | 'onDismount' | 'onDisconnect';

export interface EngagementCtx<TModel> {
    be?: string,
    with?: any,
    type: onMountStatusChange,
    stage?: PipelineStage,
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

export type PropQueryExpression<TProps> =
    | `* ${CSSQuery}` 
    | `${keyof HTMLElementTagNameMap}`
    | `${keyof HTMLElementTagNameMap} * ${CSSQuery}` 
    | `${keyof HTMLElementTagNameMap} ${PropAttrQueryType} ${keyof TProps & string}` 
    | `${keyof HTMLElementTagNameMap} ${PropAttrQueryType} ${keyof TProps & string} * ${CSSQuery}`
    | `${PropAttrQueryType} ${keyof TProps & string}`
    | `${PropAttrQueryType} ${keyof TProps & string} * ${CSSQuery}`
;

export type CSSQuery = string;

export interface ConditionGate<TProps, TMethods>{
    ifAllOf?: number[],
    ifNoneOf?: number[],
    ifEqual?: [number, number | [number] | string],
    d?: Derivative<TProps, TMethods>,

}

export type IfInstructions<TProps, TMethods> = string | boolean | number | [number] | ConditionGate<TProps, TMethods> ;

export type PropOrComputedProp<TProps, TMethods = TProps> = 
    | keyof TProps & string
    | [keyof TProps & string, (val: any) => any]
    | [keyof TProps & string, keyof TMethods & string]

export interface UnitOfWork<TProps, TMethods = TProps, TElement = Element>{
    /**
     * add event listener
     */
    a?:  AddEventListenerType<TProps, TMethods> | Array<AddEventListenerType<TProps, TMethods>>
    /**
     * observed props
     */
    o?: keyof TProps & string | PropOrComputedProp<TProps, TMethods>[],

    /**
     * derived value from observed props
     */
    d?: Derivative<TProps, TMethods>,
    /**
     * ifs ands or buts
     */
    i?: IfInstructions<TProps, TMethods>,
    /**
     * enhance / engage with element, or register the found element in some way
     */
    e?:  Engagements<TMethods>,
    /**
     * set specified property of the matching element to the (derived) value
     */
    s?: (keyof TElement & string) | {},
    /**
     * set specified attribute of the matching element to the (derived) value 
     */
    sa?: string
    /**
     * modify the host in a (mostly) declarative  way
     */
    m?: ModificationUnitOfWork<TProps, TMethods> | Array<ModificationUnitOfWork<TProps, TMethods>>
}
export type ValueFromElement<TProps, TMethods> = 
    (
        matchingElement: Element, 
        transformer: ITransformer<TProps, TMethods>, 
        mod: ModificationUnitOfWork<TProps, TMethods>
    ) => any

export interface ModificationUnitOfWork<TProps, TMethods>{
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
    toValFrom?: string | ValueFromElement<TProps, TMethods>;
    toggle?: keyof TProps & string,
}

export interface QuenitOfWork<TProps, TMethods> extends UnitOfWork<TProps, TMethods>{
    q: string,
    qi?: QueryInfo,
}

export type UnitOfWorkRHS<TProps, TMethods> = 
    | 0 
    | keyof TMethods & string 
    | keyof TProps & string
    | UnitOfWork<TProps, TMethods>
    | XForm<any, any> //unclear if this is necessary
;

export type RHS<TProps, TMethods> = UnitOfWorkRHS<TProps, TMethods> | Array<UnitOfWork<TProps, TMethods>>;

export interface QueryInfo{
    cssQuery?: string,
    localName?: string,
    propAttrType?: PropAttrQueryType
    prop?: string,
}

export type TransformerTarget = Element | DocumentFragment | Element[] | ShadowRoot;

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

export type XForm<TProps, TMethods> = Partial<{[key: string]: RHS<TProps, TMethods>}>

export interface ITransformer<TProps, TMethods>{
    target: TransformerTarget,
    model: TProps & TMethods,
    xform: XForm<TProps, TMethods>,
    propagator?: EventTarget,
}

export type ToTransformer<TProps, TMethods> = (
    target: TransformerTarget, 
    model: TProps & TMethods,
    xform: XForm<TProps, TMethods>,
    propagator?: EventTarget
) => ITransformer<TProps, TMethods>;

export interface MarkedUpEventTarget extends EventTarget{
    ___props?: Set<string>;
}