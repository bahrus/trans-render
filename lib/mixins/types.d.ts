import {UnitOfWork, ITransformer, RHS, ToTransformer, XForm} from '../../types';

export interface TemplMgmtProps<MCProps extends Partial<HTMLElement> = HTMLElement, MCMethods = MCProps>{
    mainTemplate?: HTMLTemplateElement | string;
    unsafeTCount: number;
    styles?: CSSStyleSheet[] | string;
    clonedTemplate?: Node | undefined;
    shadowRootMode?: 'open' | 'closed' | undefined | false;
    //xform: Partial<{[key: string]: RHS<any, any>}>,
    xform: XForm<any, any>,
    lcXform: XForm<any, any>,
    xformImpl?: () => Promise<ToTransformer<MCProps, MCMethods>>,
    skipTemplateClone?: boolean;
    //homeInOn?: Partial<{[key in keyof MCProps]: Partial<{[key: string]: RHS<MCProps, MCMethods>}>}>;
}


export interface TemplMgmtActions{
    doTransforms(self: this): void;
    cloneTemplate(self: this): void;
}

export interface TemplMgmtBase extends HTMLElement, TemplMgmtProps, TemplMgmtActions{}

export interface LocalizerProps {

}
export interface LocalizerMethods{
    localize(model: any, transformer: ITransformer<any, any>, uow: UnitOfWork<any, any>, matchingElement: Element): string | Partial<HTMLDataElement> | Partial<HTMLTimeElement> | undefined;
}

export interface Localizer extends HTMLElement, LocalizerProps, LocalizerMethods {}

export type LocalizerType = {new(): Localizer }