export interface RenderContext<TTarget = HTMLElement | SVGElement, TItem = any> extends Plugins{
    target?: TTarget | null;
    ctx?: RenderContext | undefined;
    cache?: any;
    previousTransform?: TransformValueOptions | undefined;
    Transform?: TransformValueOptions | TransformValueOptions[];
    level?: number | undefined;
    viewModel?: any;
    item?: TItem | undefined;
    itemTagger?:  (el: HTMLElement | SVGElement) => void;
    idx?: number | undefined;
    options?: RenderOptions | undefined;
    host?: HTMLElement | undefined;
    mode?: 'init' | 'update';
    replacedElement?: HTMLElement | SVGElement;
}

export type toTransform<TTarget = HTMLElement | SVGElement, TItem = any> = (ctx: RenderContext<TTarget, TItem>) => TransformValueOptions<TTarget>;

export interface IHydrate extends HTMLElement{
    /**
     * Any component that emits events should not do so if it is disabled.
     * Note that this is not enforced, but the disabled property is made available.
     * Users of this mix-in should ensure not to call "de" if this property is set to true.
    */
   disabled: boolean;

    /**
     * Set attribute value.
     * @param name 
     * @param val 
     * @param trueVal String to set attribute if true.
     */
    attr(name: string, val: string | boolean, trueVal?: string): void;

    connectedCallback(): void;

    /**
     * Needed for asynchronous loading
     * @param props Array of property names to "upgrade", without losing value set while element was Unknown
     */
    __propUp<TKeys extends string[] = string[]>(props: TKeys): void;

}

export interface Plugins{
    customObjProcessor?: doObjectMatchFnSig;
    repeatProcessor?: repeatFnSig;
    plugins?: {[key: string]: Plugin};
}

type doObjectMatchFnSig = (key: string, tvoo: TransformValueObjectOptions, ctx: RenderContext) => void;
type repeatFnSig = (template: ToTOrFnToTot, ctx: RenderContext, items: any[], target: HTMLElement | SVGElement, initTransform: InitTransform, updateTransform: UpdateTransform) => void;

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
    |   NappeUnion
    |   PlugInArgs
;


export type PropSettings<T extends Partial<HTMLElement> = HTMLElement> = {
    [P in keyof T]?: any
};

export type EventSettings = {[key: string] : (Function | [handler:Function, pathExpr: string] | [handler:Function, pathExpr: string, converter:Function])};
export type AttribsSettings = { [key: string]: string | boolean | number | undefined | null};
export type PSettings<T extends Partial<HTMLElement> = HTMLElement> = [props: PropSettings<T> | undefined]; 
export type PESettings<T extends Partial<HTMLElement> = HTMLElement> = [props: PropSettings<T> | undefined, on: EventSettings | undefined];
export type PEUnionSettings<T extends Partial<HTMLElement> = HTMLElement> = PSettings<T> | PESettings<T>;
export type PEASettings<T extends Partial<HTMLElement> = HTMLElement> = 
    [props: PropSettings<T> | undefined, on: EventSettings | undefined, attr: AttribsSettings | undefined];
export type PEAUnionSettings<T extends Partial<HTMLElement> = HTMLElement> = PEUnionSettings<T> | PEASettings<T>;
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

export type TemplateOrTag = HTMLTemplateElement | string;
export type TemplateTagGetter<TTarget = HTMLElement | SVGElement, TItem = any> = (x: RenderContext<TTarget, TItem>) => TemplateOrTag;
export type ToTOrFnToTot<TTarget = HTMLElement | SVGElement, TItem = any> = TemplateOrTag | TemplateTagGetter<TTarget>;
export type AT = [any[], ToTOrFnToTot];
export type ATR = [any[], ToTOrFnToTot, Range];
export type ATRI = [any[], ToTOrFnToTot, Range, InitTransform];
export type ATRIU = [any[], ToTOrFnToTot, Range, InitTransform, UpdateTransform];
export type ATRIUM = [any[], ToTOrFnToTot, Range, InitTransform, UpdateTransform, MetaSettings];
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

export type InsOrRep = InsertPosition | 'replace';
export type Na = [string];
export type Nap = [string, InsOrRep];
export type Nappe = [string, InsOrRep, PEATUnionSettings];
export type NappeUnion = Na | Nap | Nappe;

export interface EvaluatedAttributeProps{
    num: string[];
    bool: string[];
    boolish: string[];
    str: string[];
    obj: string[];
    reflect: string[];
    jsonProp: string[];
    notify: string[];
    dry: string[];
    log?: string[];
    debug?: string[];
    async?: string[];
}

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