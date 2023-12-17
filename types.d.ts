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
export type Expr4 = [...Expr3, number];
export type Expr5 = [...Expr4, string];
export type Expr6 = [...Expr5, number];
export type Expr7 = [...Expr6, string];
export type Expr8 = [...Expr7, number];
export type Expr9 = [...Expr8, string];
export type Expr10 = [...Expr9, number];
export type Expr11 = [...Expr10, string];
export type Expr12 = [...Expr11, number];

export type Action<TModel> = (matchingElement: Element, pique: IPiqueProcessor<TModel>) => Promise<UpdateInstruction<TModel>> | Promise<void>;
export type InterpolatingExpression = Expr0 | Expr1 | Expr2 | Expr3 | Expr4 | Expr5 | Expr6 | Expr7 | Expr8 | Expr9 | Expr10 | Expr11 | Expr12;
export type NumberExpression = [number];
export type ObjectExpression<TModel> = {
    [key in keyof TModel & string]: UpdateInstruction<TModel>;
};

export type UpdateInstruction<TModel> = 
    | number 
    | InterpolatingExpression 
    | Action<TModel> 
    | NumberExpression 
    | ObjectExpression<TModel>
;

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
    /**
     * props
     */
    p: keyof TModel & string | (keyof TModel & string)[],
    /**
     * ifs
     */
    i?: any,
    /**
     * update instructions
     */
    u?: UpdateInstruction<TModel>,
    /**
     * event listeners
     */
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
