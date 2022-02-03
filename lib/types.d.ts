export interface RenderContext<T = Element, TItem = any> {
    ctx?: RenderContext | undefined;
    transform?: (sourceOrTemplate: HTMLElement | DocumentFragment, ctx: RenderContext, target?: HTMLElement | DocumentFragment) => Promise<RenderContext<T>>;
    idx?: number;
    match?: any;
    mode?: 'init' | 'update';
    target?: T | null;
    targetProp?: string;
    options?: RenderOptions | undefined;
    postMatch?: postMatchProcessor[];
    attrib?: string | null;
    val?: string | null;
    rhs?: any;
    host?: HTMLElement | undefined;
    plugins?: TransformPlugins<T, TItem>;
    key?: string;
    queryCache?: WeakMap<Element, {[key: string]: NodeListOf<Element>}>;
    abort?: boolean | undefined;
    templateIds?: string[];
}

export interface TransformPluginSettings<T = Element, TItem = any> {
    processor: (ctx: RenderContext<T, TItem>) => any;
    selector?: string;
    blockWhileWaiting?: boolean;
    ready?: boolean;
    //TODO:  support for registering instances
}

export interface TransformPluginStates<T extends Element = Element, TItem = any, TState = any>  extends TransformPluginSettings<T, TItem> {
    states: WeakMap<T, TState>
}

export type TransformPlugins<T = Element, TItem = any> = {[key: string]: TransformPluginSettings<T, TItem>};

export interface RenderOptions{
    useShadow?: boolean;
    cacheQueries?: boolean | undefined;
    prepend?: boolean | undefined;
    initializedCallback?: (ctx: RenderContext, target: Element | DocumentFragment, options?: RenderOptions) => RenderContext | void,
    updatedCallback?: (ctx: RenderContext, target: Element | DocumentFragment, options?: RenderOptions) => RenderContext | void,
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



export interface TRElementProps {
    propChangeQueue?: Set<string>;
    inReflectMode?: boolean;

}

export interface TRElementActions{
    attachQR(): void;
    detachQR(): void;
    attributeChangedCallback?(n: string, ov: string, nv: string): void;
    setValsQuietly(vals: this): void;
}

export interface DefineArgs<MixinCompositeProps = any, MixinCompositeActions = MixinCompositeProps, TPropInfo = PropInfo, TAction extends Action = Action<MixinCompositeProps>>{
    superclass?: {new(): any} | string,
    mixins?: any[],
    mainTemplate?: HTMLTemplateElement;
    /** use this only for defaults that can't be JSON serialized in config */
    complexPropDefaults?: Partial<MixinCompositeProps>;
    /** Config should be 100% JSON serializable */
    config: WCConfig<MixinCompositeProps, MixinCompositeActions, TPropInfo, TAction>;
    
}

export interface WCConfig<MCProps = any, MCActions = MCProps, TPropInfo = PropInfo, TAction = Action>{
    tagName?: string;
    propDefaults?: Partial<MCProps>;
    propInfo?: Partial<{[key in keyof MCProps]: TPropInfo}> 
    actions?: Partial<{[key in keyof MCActions]: TAction | keyof MCProps}> 
    propChangeMethod?: keyof MCActions;
    style?: Partial<CSSStyleDeclaration>;
    /**
     * Used for providing hints to server side processing what css queries should be observed if using HTMLRewriter.
     */
    keyQueries?: string[];
}

export type ListOfLogicalExpressions<MCProps = any> = (keyof MCProps | LogicOp<MCProps>)[];

export type LogicOpProp<MCProps = any> = LogicOp<MCProps> | (keyof MCProps | LogicOp<MCProps>)[];

export interface LogicOp<MCProps = any>{
    /**
     * Supported by trans-render
     */
    ifAllOf?: LogicOpProp<MCProps>,
    //ifKeyIn?: (keyof MCProps & string)[],
    ifKeyIn?: (keyof MCProps & string)[],  

}

export type OpOptions = 'and' | 'or' | 'nand' | 'nor' | 'eq' | 'na';

export interface LogicEvalContext{
    op: OpOptions
}


export interface Transform<TMixinComposite = any> extends LogicOp<TMixinComposite>{
    match: {[key: string]: MatchRHS<TMixinComposite>}
}

export interface Action<MCProps = any> extends LogicOp<MCProps>{
    async?: boolean;
    target?: keyof MCProps; 
    debug?: boolean;
    setFree?: (keyof MCProps & string)[],
}

export type MatchRHS<TMixinComposite = any> = string;

type PropInfoTypes = "String" | "Number" | "Boolean" | "Object";
export interface PropInfo{
    type?: PropInfoTypes;
    dry?: boolean;
    parse?: boolean;
    isRef?: boolean;
}


export interface HasPropChangeQueue{
    propChangeQueue: Set<string> | undefined;
    QR: undefined | ((name: string, self: HasPropChangeQueue) => void);
}

export interface PropChangeInfo<TPropInfo = PropInfo> {
    key: string,
    ov: any,
    nv: any,
    prop: TPropInfo,
    pcm: PropChangeMethod | undefined;
}

export type PropChangeMoment = 'v' | '-a' | '+a' | '+qr' | '+qm';

export type PropChangeMethod = (self: EventTarget, pci: PropChangeInfo, moment: PropChangeMoment) => boolean;

export interface TemplMgmtProps{
    mainTemplate?: HTMLTemplateElement | string;
    styles?: CSSStyleSheet[];
    clonedTemplate?: Node | undefined;
    initTransform?: any;
    updateTransform?: any;
    noshadow?: boolean;
    renderOptions?: RenderOptions;
    waitToInit?: boolean;
    transformPlugins?: TransformPlugins;
}

export interface TemplMgmtActions{
    doUpdateTransform(self: this): void;
    doInitTransform(self: this): void;
    cloneTemplate(self: this): void;
}

export interface TemplMgmtBase extends HTMLElement, TemplMgmtProps, TemplMgmtActions{}