export interface RenderContext<T = Element, TItem = any> {
    ctx?: RenderContext | undefined;
    transform?: (sourceOrTemplate: HTMLElement | DocumentFragment, ctx: RenderContext, target?: HTMLElement | DocumentFragment) => RenderContext<T>;
    idx?: number;
    match?: any;
    mode?: 'init' | 'update';
    target?: T | null;
    targetProp?: string;
    options?: RenderOptions | undefined;
    postMatch?: postMatchProcessor[];
    val?: string | null;
    rhs?: any;
    host?: HTMLElement | undefined;
    queryCache?: WeakMap<Element, {[key: string]: NodeListOf<Element>}>;
    abort?: boolean | undefined;
}

export interface RenderOptions{
    prepend?: boolean | undefined;
    useShadow?: boolean;
    cacheQueries?: boolean | undefined;
    initializedCallback?: (ctx: RenderContext, target: HTMLElement | DocumentFragment, options?: RenderOptions) => RenderContext | void,
    updatedCallback?: (ctx: RenderContext, target: HTMLElement | DocumentFragment, options?: RenderOptions) => RenderContext | void,
}

export interface postMatchProcessor {
    rhsType: Function;
    rhsHeadType?: Function;
    ctor: {new(): PMDo} | PMDo;
}

export interface PMDo{
    do(ctx: RenderContext): void;
}

export type PropSettings<T extends Partial<HTMLElement> = HTMLElement> = {
    [P in keyof T]?: any
};

export type EventSettings = {[key: string] : (Function | [Function, string] | [Function, string, Function])};
export type AttribsSettings = { [key: string]: string | boolean | number | undefined | null};
export type PSettings<T extends Partial<HTMLElement> = HTMLElement> = [PropSettings<T> | undefined]; 
export type PESettings<T extends Partial<HTMLElement> = HTMLElement> = [props: PropSettings<T> | undefined, on: EventSettings | undefined];
export type PEUnionSettings<T extends Partial<HTMLElement> = HTMLElement> = PSettings<T> | PESettings<T>;
export type PEASettings<T extends Partial<HTMLElement> = HTMLElement> = 
    [props: PropSettings<T> | undefined, events: EventSettings | undefined, attribs: AttribsSettings | undefined];
export type PEAUnionSettings<T extends Partial<HTMLElement> = HTMLElement> = PEUnionSettings<T> | PEASettings<T>;
// export type PEATSettings<T extends Partial<HTMLElement> = HTMLElement> = 
//     [PropSettings<T> | undefined, EventSettings | undefined, AttribsSettings | undefined, TransformValueOptions<T> | undefined];
// export type PEAT$ettings<T extends Partial<HTMLElement> = HTMLElement> =
//     [PropSettings<T> | undefined, EventSettings | undefined, AttribsSettings | undefined, TransformValueOptions<T> | undefined, symbol]
// export type PEATUnionSettings<T extends Partial<HTMLElement> = HTMLElement> = 
//     PSettings<T> | PESettings<T> | PEASettings<T> | PEATSettings<T> | PEAT$ettings<T>;

export interface DefineArgs<TMixinComposite = any>{
    //mixins?: {new(): Object}[];
    mixins: any[],
    mainTemplate?: HTMLTemplateElement;
    /** use this only for defaults that can't be JSON serialized in config */
    complexPropDefaults?: Partial<TMixinComposite>;
    config: WCConfig<TMixinComposite>;
    
}

export interface WCConfig<TMixinComposite = any>{
    tagName: string;
    initMethod?: keyof TMixinComposite;
    propDefaults?: Partial<TMixinComposite>;
    //propInfo?: {[key in Extract<keyof TMixinComposite, string>]: PropInfo} 
    propInfo?: Partial<{[key in keyof TMixinComposite]: PropInfo}> 
    actions?: Action<TMixinComposite>[];
    notifyProps?: (keyof TMixinComposite)[];
}

export interface HasUpon<TMixinComposite = any>{
    upon?: (Extract<keyof TMixinComposite, string>)[];
    /**
     * refrain if falsy
     */
    riff?: (Extract<keyof TMixinComposite, string>)[];
    /**
     * refrain if truthy
     */
    rift?: (Extract<keyof TMixinComposite, string>)[];
    //dry?: boolean,
}

export interface Transform<TMixinComposite = any> extends HasUpon<TMixinComposite>{
    match: {[key: string]: MatchRHS<TMixinComposite>}
}

export interface Action<TMixinComposite = any> extends HasUpon<TMixinComposite>{
    do: Extract<keyof TMixinComposite, string>;
}

export type MatchRHS<TMixinComposite = any> = string;

type PropInfoTypes = "String" | "Number" | "Boolean" | "Object";
export interface PropInfo{
    type?: PropInfoTypes;
    //default?: any;
    dry?: boolean;
    parse?: boolean;
}


export interface HasPropChangeQueue{
    propChangeQueue: Set<string> | undefined;
    QR: undefined | ((name: string, self: HasPropChangeQueue) => void);
}