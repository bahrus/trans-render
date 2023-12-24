import { MountContext, PipelineStage } from "mount-observer/types";

export type PropAttrQueryType = 
    | '$' //microdata itemprop
    | '@' //form element name
    | '#' //id
    | '%' //part
    | '.' //class
    | '-' //marker

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
    | ((model: TProps & TMethods) => any)
    | NumberExpression 
    | ObjectExpression<TProps, TMethods>
    | keyof TMethods
    | boolean
;
//#endregion

export interface MethodInvocation<TMethods>{
    do: keyof TMethods,
    with?: any
}

export type onMountStatusChange = 'onMount' | 'onDismount' | 'onDisconnect';

export interface MethodInvocationCallback<TModel> {
    with?: any,
    type: onMountStatusChange,
    stage?: PipelineStage,
    mountContext: MountContext
}

export type EnhancementInstructions<TMethods> = 
    | (keyof TMethods & string)
    | MethodInvocation<TMethods> 
    | Array<MethodInvocation<TMethods>>
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
     * add event istener
     */
    a?: AddEventListener<TProps, TMethods> | Array<AddEventListener<TProps, TMethods>>
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
     * enhance, for example, add event listener
     */
    e?:  EnhancementInstructions<TMethods>,
    /**
     * set specified property of the matching element to the (derived) value
     */
    s?: (keyof TElement & string) | {},
    /**
     * set specified attribute of the matching element to the (derived) value 
     */
    sa?: string
}

export interface QuenitOfWork<TProps, TActions> extends UnitOfWork<TProps, TActions>{
    q: string,
    qi?: QueryInfo,
}

export type UnitOfWorkRHS<TProps, TMethods> = 0 | keyof TProps & string | UnitOfWork<TProps, TMethods>;

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

export type EventListenerAction<TProps, TMethods> = (keyof TMethods & string) | ((e?: Event, t?: ITransformer<TProps, TMethods>, uow?: UnitOfWork<TProps, TMethods>) => void);

export interface AddEventListener<TProps, TMethods>{
    on: string,
    do: EventListenerAction<TProps, TMethods>,
    options?: boolean | EventListenerOptions, 
}

export interface ITransformer<TProps, TMethods>{
    target: TransformerTarget,
    model: TProps & TMethods,
    xform: Partial<{[key: string]: RHS<TProps, TMethods>}>,
    propagator?: EventTarget,
    //s(p: keyof TProps, val: any): void;
}