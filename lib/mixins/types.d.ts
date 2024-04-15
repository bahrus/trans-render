import {UnitOfWork, ITransformer, RHS, ToTransformer, XForm} from '../../types';

export interface TemplMgmtProps<MCProps extends Partial<HTMLElement> = HTMLElement, MCMethods = MCProps>{
    mainTemplate?: HTMLTemplateElement | string;
    unsafeTCount: number;
    styles?: CSSStyleSheet[] | string;
    clonedTemplate?: Node | undefined;
    shadowRootMode?: 'open' | 'closed' | undefined | false;
    //xform: Partial<{[key: string]: RHS<any, any>}>,
    /**
     * transform within ShadowRoot if applicable
     */
    xform: XForm<any, any, any>,
    /**
     * transform applied to light children, if applicable
     * Use ":root" to match on the root element
     */
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

