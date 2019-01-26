export type TransformFn = (arg: TransformArg) => TransformRules | NextStep | string | void;
export type TransformValueOptions =  TransformRules | TransformFn;
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



export interface RenderContext {
    init?: (template: HTMLTemplateElement, ctx: RenderContext, target: HTMLElement | DocumentFragment, options?: RenderOptions) => RenderContext,
    leaf?: Element,
    Transform?: TransformRules,
    template?: DocumentFragment,
    update?: (ctx: RenderContext, target: HTMLElement | DocumentFragment) => RenderContext;
    refs?: {[key: string] : any},
}

export interface RenderOptions{
    prepend?: boolean | undefined;
}