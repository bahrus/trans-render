export type TransformFn<TargetType extends HTMLElement = HTMLElement> 
    = (arg: TransformArg<TargetType>) => TransformRules | NextStep | string | HTMLTemplateElement | void | boolean | PEATSettings<TargetType>;

export type TransformRules = { [key: string]: TransformValueOptions};
export interface TransformArg<TargetType extends HTMLElement = HTMLElement> {
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

export type PropSettings = {[key: string] : any};
export type EventSettings = {[key: string] : (e: Event ) => void};
export type AttribsSettings = { [key: string]: string | boolean | number | undefined | null};
export type PSettings = [PropSettings]; 
export type PESettings = [PropSettings, EventSettings];
export type PEASettings = [PropSettings, EventSettings, AttribsSettings];
export type PEATSettings<TargetType extends HTMLElement = HTMLElement> = [PropSettings, EventSettings, AttribsSettings, TransformValueOptions<TargetType>];
export type PEATUnionSettings<TargetType extends HTMLElement = HTMLElement> = 
    PSettings | PESettings | PEASettings | PEATSettings<TargetType>;
export type TransformValueOptions<TargetType extends HTMLElement = HTMLElement> 
    =   
        TransformRules // css selector
        | TransformFn<TargetType> 
        | string // value goes into textContent
        | HTMLTemplateElement // clone template
        | boolean //if false, target is removed from tree
        | PEATUnionSettings<TargetType>
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
    //repeatInit?: (template: HTMLTemplateElement, ctx: RenderContext, count: number, target: Element, targetTransform?: TransformValueOptions) => TransformValueOptions;
    //repeatUpdate?: (template: HTMLTemplateElement, ctx: RenderContext, count: number, target: HTMLElement, targetTransform?: TransformValueOptions) => TransformValueOptions;
    repeat?: (template: HTMLTemplateElement, ctx: RenderContext, count: number, target: HTMLElement, targetTransform?: TransformValueOptions) => TransformValueOptions;
    repeateth?: (template: HTMLTemplateElement, ctx: RenderContext, count: number, target: HTMLElement, targetTransform?: TransformValueOptions) => TransformValueOptions;
    interpolate?: (target: any, prop: string, obj: any, isAttr: boolean) => void;
    insertAdjacentTemplate?: (template: HTMLTemplateElement, target: Element, position: InsertPosition) => void;
    decorate?<T extends HTMLElement>(target: T, decor: DecorateArgs) : void;
    split?: (target: HTMLElement, textContent: string, search: string | null | undefined) => void;
    replaceElementWithTemplate?: (target: HTMLElement, template: HTMLTemplateElement, ctx: RenderContext) => void;
    replaceTargetWithTag?: (target: HTMLElement, tag: string, ctx: RenderContext, postSwapCallback?: (el: HTMLElement) => void) => void;
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
}

export interface RenderOptions{
    prepend?: boolean | undefined;
    initializedCallback?: (ctx: RenderContext, target: HTMLElement | DocumentFragment, options?: RenderOptions) => RenderContext | void,
    updatedCallback?: (ctx: RenderContext, target: HTMLElement | DocumentFragment, options?: RenderOptions) => RenderContext | void,
}

export interface TransRenderWC{
    viewModel: object;
}

export type Partial<T> = {
    [P in keyof T]?: T[P];
}
