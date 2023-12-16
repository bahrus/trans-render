export interface FragmentManifest<TModel = any>{
    //match: {[key: string]: }
}

export type propQueryType = 
    '$' //microdata itemprop
    | '@' //form element name
    | '#' //id
    | '%' //part
    | '.' //css
    | '-' //marker

export type Expr0 = [string, number];
export type Expr1 = [...Expr0, string];
export type Expr2 = [...Expr1, number];
export type Expr3 = [...Expr2, string];

export type InterpolatingExpression = number | Expr0 | Expr1 | Expr2 | Expr3;



export type PropQueryExpression =
    | `* ${CSSQuery}` 
    | `${keyof HTMLElementTagNameMap}`
    | `${keyof HTMLElementTagNameMap} * ${CSSQuery}` 
    | `${keyof HTMLElementTagNameMap} ${propQueryType} ${number}` 
    | `${keyof HTMLElementTagNameMap} ${propQueryType} ${number} * ${CSSQuery}`
    | `${propQueryType} ${number}`
    | `${propQueryType} ${number} * ${CSSQuery}`
;

export type CSSQuery = string;

export interface ManifestRule<TModel>{
    p: keyof TModel & string | (keyof TModel & string)[],
    i: any,
    q: PropQueryExpression,
    u: InterpolatingExpression,
    e: any,

}

export interface QueryInfo{
    cssQuery?: string,
    localName?: string,
    propAttrType?: 
        | '$' //microdata itemprop
        | '@' //form element name
        | '#' //id
        | '%' //part
        | '.' //css
        | '-' //marker
}

// export type TransformerTarget = Element | DocumentFragment | Element[] | ShadowRoot

// export type Model = {} | EventTarget;

// export interface RenderContext {

// }

// export type PropExp<TModel> =
//     keyof TModel | `.${keyof TModel & string}${string}` | 0;

// export type InterpolatingModeProps<TModel> = 
//     boolean | number | PropExp<TModel> | [string] | [string, PropExp<TModel>]
// ;

// export type PropSettings<TModel = any, TTarget = Element> =  {
//     [P in keyof TTarget]: InterpolatingModeProps<TModel>;//TODO: lots more options
// }

export interface RegExpExt<TStatementGroup = any>{
    regExp: RegExp,
    defaultVals: TStatementGroup,
}

export type RegExpOrRegExpExt<TStatementGroup = any> = RegExp | RegExpExt<TStatementGroup>;
    
