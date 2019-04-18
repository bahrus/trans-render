export type TransformFn = (arg: TransformArg) => TransformRules | NextStep | string | void;
export type TransformValueOptions =  TransformRules | TransformFn | string;
export type TransformRules = { [key: string]: TransformValueOptions};
export interface TransformArg {
    target: Element,
    ctx: RenderContext,
    idx: number,
    level: number,
}

export interface NextStep {
    Transform?: TransformRules,
    NextMatch?: string,
    Select?: TransformRules | null,
    MergeTransforms?: boolean,
    SkipSibs?: boolean,
}

export type AttribsSettings = { [key: string]: string | boolean | number | undefined };

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

export interface RenderContext {
    init?: (template: HTMLElement, ctx: RenderContext, target: HTMLElement | DocumentFragment, options?: RenderOptions) => RenderContext,
    repeatInit?: (template: HTMLTemplateElement, ctx: RenderContext, count: number, target: Element, targetTransform?: TransformValueOptions) => TransformValueOptions;
    repeatUpdate?: (template: HTMLTemplateElement, ctx: RenderContext, count: number, target: HTMLElement, targetTransform?: TransformValueOptions) => TransformValueOptions;
    interpolate?: (target: any, prop: string, obj: any, isAttr: boolean) => void;
    decorate?<T extends HTMLElement>(target: T, decor: DecorateArgs) : void;
    leaf?: Element | DocumentFragment,
    Transform?: TransformRules,
    update?: (ctx: RenderContext, target: HTMLElement | DocumentFragment) => RenderContext;
    refs?: {[key: string] : any},
    viewModel?: any,
    host?: HTMLElement,
    symbols?: {[key: string] : symbol},
}

export interface RenderOptions{
    prepend?: boolean | undefined;
    initializedCallback?: (ctx: RenderContext, target: Element | DocumentFragment, options?: RenderOptions) => RenderContext | void,
    updatedCallback?: (ctx: RenderContext, target: Element | DocumentFragment, options?: RenderOptions) => RenderContext | void,
}