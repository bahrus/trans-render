import { MountContext, PipelineStage } from "mount-observer/types";
import { ConvertOptions, Scope } from "./lib/types";


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
export type DerivationCriteria<TProps, TMethods> = {
    //[key: string]: Derivative<TProps, TMethods>;
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

export type Derivative<TProps, TMethods> = 
    | number 
    | InterpolatingExpression 
    | ((model: TProps & TMethods, transform: ITransformer<TProps, TMethods>, uow: UnitOfWork<TProps, TMethods>, matchingElement: Element) => any)
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

//export interface EscalateProp

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

export type PropQueryExpression<TProps> =
    | `* ${CSSQuery}` 
    | `${keyof HTMLElementTagNameMap}`
    | `${PropAttrQueryType} ${keyof TProps & string}`
    | `:root`
    | `- :${string}`
    | `- ${string}=${keyof TProps & string}`
    | `- :x=:y`
    | `- -:x=:y`
;

export type LHS<TProps> = PropQueryExpression<TProps>;

export type CSSQuery = string;

export interface ConditionGate<TProps, TMethods>{
    ifAllOf?: number[],
    ifNoneOf?: number[],
    ifEqual?: [number, number | [number] | string],
    d?: Derivative<TProps, TMethods>,

}

export type WhereConditions = 
    | string //css matches
    | {
        matches: string,
        mediaMatches: string,
        containerQuery: string,
    }

export type IfInstructions<TProps, TMethods> = string | boolean | number | [number] | ConditionGate<TProps, TMethods> ;

export interface ObservePropParams {
    derivePropFrom?: string,
}
export type PropOrComputedProp<TProps, TMethods = TProps> = 
    | keyof TProps & string
    | [keyof TProps & string, (val: any) => any]
    | [keyof TProps & string, keyof TMethods & string]
    | ObservePropParams
    | `:${string}`

export interface UnitOfWork<TProps, TMethods = TProps, TElement = Element>{
    /**
     * add event listener
     */
    a?:  AddEventListenerType<TProps, TMethods> | Array<AddEventListenerType<TProps, TMethods>>,

    /**
     * derived value from observed props
     */
    d?: Derivative<TProps, TMethods>,

    /**
     * enhance / engage with element, or register the found element in some way
     */
    e?:  Engagements<TMethods>,

    /**
     * ifs ands or buts -- conditions on the model
     */
    i?: IfInstructions<TProps, TMethods>,

    /**
     * method of matching element to pass derived value into
     * [TODO]
     */
    invoke?: string,

    /**
     * modify the host in a (mostly) declarative  way
     */
    m?: ModificationUnitOfWork<TProps, TMethods> | Array<ModificationUnitOfWork<TProps, TMethods>>,

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
    isRootQry?: boolean,
    isParametrizedQry?: boolean,
    localPropKebabCase?: string,
    localPropCamelCase?: string,
    cssQuery?: string,
    localName?: string,
    propAttrType?: PropAttrQueryType
    prop?: string,
    w?: WhereConditions,
    css?: string,
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
export type XForm<TProps, TMethods> = Partial<{
    [key in LHS<TProps>]: RHS<TProps, TMethods>;
}>;

export interface ITransformer<TProps, TMethods>{
    target: TransformerTarget,
    model: TProps & TMethods,
    xform: XForm<TProps, TMethods>,
    options: TransformOptions,
    //propagator?: EventTarget,
}

export type ToTransformer<TProps, TMethods> = (
    target: TransformerTarget, 
    model: TProps & TMethods,
    xform: XForm<TProps, TMethods>,
    propagator?: EventTarget
) => ITransformer<TProps, TMethods>;

export interface MarkedUpEventTarget extends EventTarget{
    ___props?: Set<string>;
    ___nestedProps?: Map<string, any>;
}

export interface TransRenderEndUserProps<ModelProps, ModelMethods = ModelProps>{
    xform: XForm<ModelProps, ModelMethods>;
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