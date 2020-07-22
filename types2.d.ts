export interface RenderContext<TTarget = HTMLElement | SVGElement, TItem = any> extends Plugins{
    target?: TTarget | null;
    ctx?: RenderContext | undefined;
    cache?: any;
    previousTransform?: TransformValueOptions | undefined;
    Transform?: TransformValueOptions;
    level?: number | undefined;
    viewModel?: any;
    item?: TItem | undefined;
    itemTagger?:  (el: HTMLElement | SVGElement) => void;
    idx?: number | undefined;
    options?: RenderOptions | undefined;
    host?: HTMLElement | undefined;
    mode?: 'init' | 'update';
    replacedElement?: HTMLElement;
}

export interface Plugins{
    customObjProcessor?: doObjectMatchFnSig;
    repeatProcessor?: repeatFnSig;
    plugins?: {[key: string]: Plugin};
}

type doObjectMatchFnSig = (key: string, tvoo: TransformValueObjectOptions, ctx: RenderContext) => void;
type repeatFnSig = (template: HTMLTemplateElement, ctx: RenderContext, items: any[], target: HTMLElement | SVGElement, initTransform: InitTransform, updateTransform: UpdateTransform) => void;

export interface Plugin{
    fn: Function;
    sym: symbol;
}

export interface RenderOptions{
    prepend?: boolean | undefined;
    initializedCallback?: (ctx: RenderContext, target: HTMLElement | DocumentFragment, options?: RenderOptions) => RenderContext | void,
    updatedCallback?: (ctx: RenderContext, target: HTMLElement | DocumentFragment, options?: RenderOptions) => RenderContext | void,
}

export type TransformMatch =  {[key: string]: TransformValueOptions};  // css selector

export interface NextStep {
    Transform?: TransformValueOptions,
    NextMatch?: string,
    Select?: string,
    MergeTransforms?: boolean,
    SkipSibs?: boolean,
}

export type TransformValueOptions<TargetType extends Partial<HTMLElement> = HTMLElement> =
        TransformValueObjectOptions<TargetType>
    |   NextStep 
    |   string
    |   boolean

;

export type TransformValueObjectOptions<TargetType extends Partial<HTMLElement> = HTMLElement> = 
        TransformMatch
    |   TransformValueArrayOptions<TargetType>  
    |   HTMLTemplateElement
;

export type TransformValueArrayOptions<TargetType extends Partial<HTMLElement> = HTMLElement> =
        PEATUnionSettings<TargetType>
    |   ATRIUM_Loop
    |   CATMINT_Conditional
    |   PlugInArgs
;


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


export type ArraySlot = any[] | undefined;


export type Range = [number, number] | number | undefined;

export type InitTransform = TransformValueOptions | undefined;

export type UpdateTransform = TransformValueOptions | undefined;

export type MetaSettings = any;

export type AT = [any[], HTMLTemplateElement];
export type ATR = [any[], HTMLTemplateElement, Range];
export type ATRI = [any[], HTMLTemplateElement, Range, InitTransform];
export type ATRIU = [any[], HTMLTemplateElement, Range, InitTransform, UpdateTransform];
export type ATRIUM = [any[], HTMLTemplateElement, Range, InitTransform, UpdateTransform, MetaSettings];
export type ATRIUM_Loop = AT | ATR | ATRI | ATRIU | ATRIUM; // | ATRIUMS;

export type PlugInArgs = [symbol, ...any[]];

export interface MetaInstructions{
    yesSym?: Symbol;
    noSym?: Symbol;
    eitherSym?: Symbol;
}

export type CAT = [boolean, HTMLTemplateElement];
export type CATMI = [boolean, HTMLTemplateElement, MetaInstructions | undefined];
export type CATMINT = [boolean, HTMLTemplateElement, MetaInstructions | undefined, HTMLTemplateElement];
export type CATMINT_Conditional = CAT | CATMI | CATMINT;
