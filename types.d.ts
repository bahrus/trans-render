export interface FragmentManifest<TModel = any>{
    piques?: Pique<TModel>[],
    //piqueMap?: {[key in PropQueryExpression]: PiqueWOQ<TModel>}
    piqueMap?: {[key: string]: PiqueWOQ<TModel>}
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

export type Action<TModel> = (matchingElement: Element, pique: IPiqueProcessor<TModel>) => Promise<UpdateInstruction<Model>> | Promise<void>;
export type InterpolatingExpression = number | Expr0 | Expr1 | Expr2 | Expr3;
export type UpdateInstruction<TModel> = InterpolatingExpression | Action<TModel>;

export interface IPiqueProcessor<TModel>{

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

export interface PiqueWOQ<TModel>{
    p: keyof TModel & string | (keyof TModel & string)[],
    i?: any,
    u?: UpdateInstruction<TModel>,
    e?: any,
}

export interface Pique<TModel> extends PiqueWOQ<TModel>{
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
