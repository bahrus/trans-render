export interface FragmentManifest<TProps = any, TActions = TProps>{
    piques?: Pique<TProps>[],
    //piqueMap?: {[key in PropQueryExpression]: PiqueWOQ<TProps>}
    piqueMap?: {[key: string]: PiqueWOQ<TProps>}
}

export type PropAttrQueryType = 
    | '$' //microdata itemprop
    | '@' //form element name
    | '#' //id
    | '%' //part
    | '.' //css
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

export type Action<TProps> = (matchingElement: Element, pique: IPiqueProcessor<TProps>) => Promise<UpdateInstruction<TProps>> | Promise<void>;
export type InterpolatingExpression = Expr0 | Expr1 | Expr2 | Expr3 | Expr4 | Expr5 | Expr6 | Expr7 | Expr8 | Expr9 | Expr10 | Expr11 | Expr12;
export type NumberExpression = [number];
export type ObjectExpression<TProps> = {
    [key: string]: UpdateInstruction<TProps>;
};

export type UpdateInstruction<TProps> = 
    | number 
    | InterpolatingExpression 
    | Action<TProps> 
    | NumberExpression 
    | ObjectExpression<TProps>
    | string
    | boolean
;

export type EventListenerInstruction = [];

export type EventListenerInstructions<TProps> = Array<EventListenerInstruction>;

export interface IPiqueProcessor<TProps, TActions = TProps>{
    //TODO add all the methods
}

export type PropQueryExpression =
    | `* ${CSSQuery}` 
    | `${keyof HTMLElementTagNameMap}`
    | `${keyof HTMLElementTagNameMap} * ${CSSQuery}` 
    | `${keyof HTMLElementTagNameMap} ${PropAttrQueryType} ${number}` 
    | `${keyof HTMLElementTagNameMap} ${PropAttrQueryType} ${number} * ${CSSQuery}`
    | `${PropAttrQueryType} ${number}`
    | `${PropAttrQueryType} ${number} * ${CSSQuery}`
;

export type CSSQuery = string;

export interface PiqueWOQ<TProps, TMethods = TProps>{
    /**
     * props
     */
    p: keyof TProps & string | (keyof TProps & string)[],
    /**
     * ifs
     */
    i?: any,
    /**
     * update instructions
     */
    u?: UpdateInstruction<TProps>,
    /**
     * event listeners
     */
    e?: EventListenerInstructions<TMethods>,
}

export interface Pique<TProps> extends PiqueWOQ<TProps>{
    q: PropQueryExpression,
}

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
