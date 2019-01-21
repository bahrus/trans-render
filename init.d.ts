export type TransformFn = (arg: TransformArg) => TransformRules | NextSteps | string | void;
export type TransformValueOptions =  TransformRules | TransformFn;
export type TransformRules = { [key: string]: TransformValueOptions};
export interface TransformArg {
    target: Element,
    ctx: RenderContext,
    idx: number,
    level: number,
}

export interface NextSteps {
    matchFirstChild?: boolean | TransformRules,
    matchNextSib?: boolean,
    nextMatch?: string,
    select?: TransformRules | null,
    inheritMatches?: boolean,
}

export interface RenderContext {
    init?: (template: HTMLTemplateElement, ctx: RenderContext, target: HTMLElement | DocumentFragment, options?: RenderOptions) => RenderContext,
    leaf?: Element,
    transform?: TransformRules,
    //inheritMatches?: boolean,
    template?: DocumentFragment,
    update?: (ctx: RenderContext, target: HTMLElement | DocumentFragment) => RenderContext;
}

export interface RenderOptions{
    prepend?: boolean | undefined;
    matchNext?: boolean | undefined;
}