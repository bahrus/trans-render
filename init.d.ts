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


export interface DecorateArgs{
    props?: {[key: string]: any} | undefined,
    methods?: {[key: string] : Function} | undefined,
    on?: {[key: string] : (e: Event) => void} | undefined,
    class?: string | string[] | undefined,
    attribs?: {[key: string] : string | boolean}
}

export interface RenderContext {
    init?: (template: HTMLElement, ctx: RenderContext, target: HTMLElement | DocumentFragment, options?: RenderOptions) => RenderContext,
    repeatInit?: (template: HTMLTemplateElement, ctx: RenderContext, count: number, target: Element, targetTransform?: TransformValueOptions) => TransformValueOptions;
    repeatUpdate?: (template: HTMLTemplateElement, ctx: RenderContext, count: number, target: HTMLElement, targetTransform?: TransformValueOptions) => TransformValueOptions;
    interpolate?: (target: any, prop: string, obj: any, isAttr: boolean) => void;
    decorate?<T extends HTMLElement>(target: T, vals: T | null, decor?: DecorateArgs) : void;
    leaf?: Element | DocumentFragment,
    Transform?: TransformRules,
    update?: (ctx: RenderContext, target: HTMLElement | DocumentFragment) => RenderContext;
    refs?: {[key: string] : any},
    viewModel?: any,
}

export interface RenderOptions{
    prepend?: boolean | undefined;
    initializedCallback?: (ctx: RenderContext, target: HTMLElement | DocumentFragment, options?: RenderOptions) => RenderContext | void,
    updatedCallback?: (ctx: RenderContext, target: HTMLElement | DocumentFragment, options?: RenderOptions) => RenderContext | void,
}