export interface RenderContext<T = Element, TItem = any> {
    ctx?: RenderContext | undefined;
    match?: any;
    mode?: 'init' | 'update';
    target?: T | null;
    options?: RenderOptions | undefined;
    psm?: PostScriptMap[];
    val?: string | null;
    rhs?: any;
}

export interface RenderOptions{
    prepend?: boolean | undefined;
    useShadow?: boolean;
    initializedCallback?: (ctx: RenderContext, target: HTMLElement | DocumentFragment, options?: RenderOptions) => RenderContext | void,
    updatedCallback?: (ctx: RenderContext, target: HTMLElement | DocumentFragment, options?: RenderOptions) => RenderContext | void,
}

export interface PostScriptMap {
    type: Function;
    ctor: {new(): PSDo} | PSDo;
}

export interface PSDo{
    do(ctx: RenderContext): void;
}