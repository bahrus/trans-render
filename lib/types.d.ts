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



export interface TRElementMixin {
    propChangeQueue?: Set<string>;
    attributeChangedCallback?(n: string, ov: string, nv: string): void;
}

export interface DefineArgs<MixinCompositeProps = any, TPropInfo = PropInfo, MixinCompositeActions = MixinCompositeProps>{
    superclass?: {new(): any},
    mixins?: any[],
    mainTemplate?: HTMLTemplateElement;
    /** use this only for defaults that can't be JSON serialized in config */
    complexPropDefaults?: Partial<MixinCompositeProps>;
    /** Config should be 100% JSON serializable */
    config: WCConfig<MixinCompositeProps, TPropInfo, MixinCompositeActions>;
    
}

export interface WCConfig<MCProps = any, TPropInfo = PropInfo, MCActions = MCProps>{
    tagName: string;
    propDefaults?: Partial<MCProps>;
    propInfo?: Partial<{[key in keyof MCProps]: TPropInfo}> 
    actions?: Partial<{[key in keyof MCActions]: Action<MCProps>}> 
    propChangeMethod?: keyof MCActions;
    style?: Partial<CSSStyleDeclaration>;
}

export type ListOfLogicalExpressions<MCProps = any> = (keyof MCProps | LogicOp<MCProps>)[];

export type LogicOpProp<MCProps = any> = LogicOp<MCProps> | (keyof MCProps | LogicOp<MCProps>)[];

export interface LogicOp<MCProps = any>{
    /**
     * Supported by trans-render
     */
    ifAllOf?: LogicOpProp<MCProps>,
    ifKeyIn?: (keyof MCProps & string)[],
    orKeyIn?: (keyof MCProps & string)[],  
    /**
     * The following are not supported by trans-render
     */
    andAllOf?: LogicOpProp<MCProps>,
    orAllOf?: LogicOpProp<MCProps>,
    ifAnyOf?: LogicOpProp<MCProps>,
    andAnyOf?: LogicOpProp<MCProps>,
    orAnyOf?: LogicOpProp<MCProps>
    ifNot?: LogicOpProp<MCProps>,
    andIfNot?: LogicOpProp<MCProps>,
    orIfNot?: LogicOpProp<MCProps>,
    ifEquals?: LogicOpProp<MCProps>,
    andIfEquals?: LogicOpProp<MCProps>,
    orIfEquals?: LogicOpProp<MCProps>,
}

export type lop = 'and' | 'or';

export interface Transform<TMixinComposite = any> extends LogicOp<TMixinComposite>{
    match: {[key: string]: MatchRHS<TMixinComposite>}
}

export interface Action<MCProps = any> extends LogicOp<MCProps>{
    async?: boolean;
    merge?: boolean;
}

export type MatchRHS<TMixinComposite = any> = string;

type PropInfoTypes = "String" | "Number" | "Boolean" | "Object";
export interface PropInfo{
    type?: PropInfoTypes;
    dry?: boolean;
    parse?: boolean;
}


export interface HasPropChangeQueue{
    propChangeQueue: Set<string> | undefined;
    QR: undefined | ((name: string, self: HasPropChangeQueue) => void);
}

export interface PropChangeInfo<TPropInfo = PropInfo> {
    key: string,
    ov: any,
    nv: any,
    prop: TPropInfo
}

export type PropChangeMoment = 'v' | '-a' | '+a' | '+qr';