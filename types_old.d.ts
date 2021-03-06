
export type TransformFn<TargetType extends Partial<HTMLElement> = HTMLElement> 
    = (arg: TransformArg<TargetType>) => TransformRules | NextStep | string | HTMLTemplateElement | void | boolean | PEATSettings<TargetType>;

export type TransformRules = { [key: string]: TransformValueOptions};
export interface TransformArg<TargetType extends Partial<HTMLElement> = HTMLElement> {
    target: TargetType,
    ctx: RenderContext,
    idx: number,
    level: number,
    item: any,
}


export interface NextStep {
    Transform?: TransformRules,
    NextMatch?: string,
    Select?: TransformRules | null,
    MergeTransforms?: boolean,
    SkipSibs?: boolean,
}

export type PropSettings<T extends Partial<HTMLElement> = HTMLElement> = {
    [P in keyof T]?: any
};

export type EventSettings = {[key: string] : (Function | [Function, string] | [Function, string, Function])};
export type AttribsSettings = { [key: string]: string | boolean | number | undefined | null};
export type PSettings<T extends Partial<HTMLElement> = HTMLElement> = [PropSettings<T> | undefined]; 
export type PESettings<T extends Partial<HTMLElement> = HTMLElement> = [PropSettings<T> | undefined, EventSettings | undefined];
export type PEASettings<T extends Partial<HTMLElement> = HTMLElement> = 
    [PropSettings<T> | undefined, EventSettings | undefined, AttribsSettings | undefined];
export type PEAUnionSettings<T extends Partial<HTMLElement> = HTMLElement> = PSettings<T> | PESettings<T> | PEASettings<T>;
export type PEATSettings<T extends Partial<HTMLElement> = HTMLElement> = 
    [PropSettings<T> | undefined, EventSettings | undefined, AttribsSettings | undefined, TransformValueOptions<T> | undefined];
export type PEAT$ettings<T extends Partial<HTMLElement> = HTMLElement> =
    [PropSettings<T> | undefined, EventSettings | undefined, AttribsSettings | undefined, TransformValueOptions<T> | undefined, symbol]
export type PEATUnionSettings<T extends Partial<HTMLElement> = HTMLElement> = 
    PSettings<T> | PESettings<T> | PEASettings<T> | PEATSettings<T> | PEAT$ettings<T>;
export type TransformValueOptions<TargetType extends Partial<HTMLElement> = HTMLElement> 
    =   
        TransformRules // css selector
        | TransformFn<TargetType> 
        | string // value goes into textContent
        | HTMLTemplateElement // clone template
        | boolean //if false, target is removed from tree
        | PEATUnionSettings<TargetType>
        | Symbol
        ; 
//export type props = {[key: string] : any};
export interface Vals<TAttribsSettings = AttribsSettings, TProps = object> {
  attribs?: AttribsSettings;
  propVals?: object;
}

export interface DecorateArgs<TAttribsSettings = AttribsSettings, TProps = object> extends Vals{
    propDefs?: object,
    methods?: {[key: string] : Function},
    on?: {[key: string] : (e: Event) => void},
}

export type DecorateTuple = [object, AttribsSettings, {[key: string] : (e: Event) => void}, object, {[key: string] : Function}];

export interface RenderContext {
    init?: (template: HTMLElement, ctx: RenderContext, target: HTMLElement | DocumentFragment, options?: RenderOptions) => RenderContext,
    cache?: any,
    repeat?: (template: HTMLTemplateElement, ctx: RenderContext, count: number, target: HTMLElement, targetTransform?: TransformValueOptions) => TransformValueOptions;
    repeateth?: (template: HTMLTemplateElement, ctx: RenderContext, count: number, target: HTMLElement, targetTransform?: TransformValueOptions) => TransformValueOptions;
    interpolate?: (target: any, prop: string, obj: any, isAttr: boolean) => void;
    insertAdjacentTemplate?: (template: HTMLTemplateElement, target: Element, position: InsertPosition) => void;
    decorate?<T extends HTMLElement>(target: T, decor: DecorateArgs) : void;
    split?: (target: HTMLElement, textContent: string, search: string | null | undefined) => void;
    replaceElementWithTemplate?: (target: HTMLElement, ctx: RenderContext, template: HTMLTemplateElement | [symbol, string]) => void;
    replaceTargetWithTag?: (target: HTMLElement, ctx: RenderContext, tag: string, preSwapCallback?: (el: HTMLElement) => void) => void;
    appendTag?: (container: HTMLElement, name: string, config: DecorateArgs) => HTMLElement;
    leaf?: HTMLElement | DocumentFragment,
    Transform?: TransformRules,
    update?: (ctx: RenderContext, target: HTMLElement | DocumentFragment) => RenderContext;
    refs?: {[key: string] : any},
    viewModel?: any,
    host?: HTMLElement,
    symbols?: {[key: string] : symbol},
    replacedElement?: HTMLElement,
    pierce?: (el: HTMLElement, ctx: RenderContext, targetTransform: TransformRules) => void;
    templates?: {[key: string]: HTMLTemplateElement};
    itemsKey?: symbol;
    skipSymBind?: boolean;
}

export interface RenderOptions{
    prepend?: boolean | undefined;
    initializedCallback?: (ctx: RenderContext, target: HTMLElement | DocumentFragment, options?: RenderOptions) => RenderContext | void,
    updatedCallback?: (ctx: RenderContext, target: HTMLElement | DocumentFragment, options?: RenderOptions) => RenderContext | void,
}

export interface TransRenderWC{
    viewModel: object;
}





export interface UpdateContext extends RenderContext {
    update: (ctx: RenderContext, target: HTMLElement | DocumentFragment) => UpdateContext;
}

interface ItemStatus{
    version: number | string;
    breaking: boolean;
    inScope: boolean;
    identity: number | string;
}

export interface EvaluatedAttributeProps{
    num: string[];
    bool: string[];
    str: string[];
    obj: string[];
    reflect: string[];
    jsonProp: string[];
    notify: string[];
    dry: string[];
    log?: string[];
    debug?: string[];
    async?: string[];
}
