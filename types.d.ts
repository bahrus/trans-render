import { MountContext, PipelineStage } from "mount-observer/types";

// export interface FragmentManifest<TProps = any, TActions = TProps>{
//     piques?: Pique<TProps, TActions>[],
//     piqueMap?: {[key in PropQueryExpression]: PiqueWOQ<TProps>}
//     //piqueMap?: {[key: string]: PiqueWOQ<TProps, TActions>}
// }

export type PropAttrQueryType = 
    | '$' //microdata itemprop
    | '@' //form element name
    | '#' //id
    | '%' //part
    | '.' //class
    | '-' //marker

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

export type Action<TProps> = (matchingElement: Element, pique: IPiqueProcessor<TProps>) => Promise<Derivative<TProps>> | Promise<void>;
export type InterpolatingExpression = Expr0 | Expr1 | Expr2 | Expr3 | Expr4 | Expr5 | Expr6 | Expr7 | Expr8 | Expr9 | Expr10 | Expr11 | Expr12;
export type NumberExpression = [number];
export type ObjectExpression<TProps> = {
    [key: string]: Derivative<TProps>;
};

export type Derivative<TProps> = 
    | number 
    | InterpolatingExpression 
    | Action<TProps> 
    | NumberExpression 
    | ObjectExpression<TProps>
    | string
    | boolean
;

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

export interface IPiqueProcessor<TProps, TActions = TProps>{
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

export interface ConditionalUpdate<TProps>{
    ifAllOf?: number[],
    ifNoneOf?: number[],
    ifEqual?: [number, number | [number] | string],
    u: Derivative<TProps>
}

export type IfInstructions<TProps> = ConditionalUpdate<TProps> | Array<ConditionalUpdate<TProps>>;

export type PropOrComputedProp<TProps, TMethods = TProps> = 
    | keyof TProps & string
    | [keyof TProps & string, (val: any) => any]
    | [keyof TProps & string, keyof TMethods & string]
export interface PiqueWOQ<TProps, TMethods = TProps, TElement = Element>{
    /**
     * props
     */
    o: PropOrComputedProp<TProps, TMethods>[],

    /**
     * derived value
     */
    d?: Derivative<TProps>,
    /**
     * ifs
     */
    i?: IfInstructions<TProps>,
    /**
     * enhance, for example, add event listener
     */
    e?:  EnhancementInstructions<TMethods>,
    /**
     * set value of target
     */
    s?: (keyof TElement & string) | Partial<TElement>
}

export interface Pique<TProps, TActions> extends PiqueWOQ<TProps, TActions>{
    //q: PropQueryExpression,
    q: string,
    qi?: QueryInfo,
}

export type RHS<TProps, TActions> = 0 | keyof TProps & string | PiqueWOQ<TProps, TActions>;

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

