export interface RenderContext<TItem = any>{
    target?: HTMLElement | null;
    ctx?: RenderContext | undefined;
    cache?: any;
    previousTransform?: TransformValueOptions | undefined;
    Transform?: TransformValueOptions;
    level?: number | undefined;
    item?: TItem | undefined;
    itemTagger?:  (el: HTMLElement) => void;
    idx?: number | undefined;
    options?: RenderOptions | undefined;
    host?: HTMLElement | undefined;
    mode?: 'init' | 'update';
    replacedElement?: HTMLElement,
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
    |   ATRIUM_Union
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
export type ATRIUMS = [any[], HTMLTemplateElement, Range, InitTransform, UpdateTransform, MetaSettings, symbol];
export type ATRIUM_Union = AT | ATR | ATRI | ATRIU | ATRIUM | ATRIUMS;

