import { Scope } from "../lib/types";

export type DirectionalScopeSigils = 
    /**
     * upward direction, non recursive
     */
    '^' | 
    /**
     * downward direction, next element siblings only
     */
    'Y' |
    /**
     * IdRef query
     * 
     */ 
    '?';

export type AttrSigils = '$0' | '#' | '@' |  '-' | '|' | '%';

export type ElementSigils = '/' | '~';

export type Sigils = AttrSigils | ElementSigils;

export interface Specifier {
    /** Directional Scope Sigil */
    dss?: DirectionalScopeSigils,
    rec?: boolean,
    /**
     * root node fallback
     */
    rnf?: boolean,
    
    scopeS?: CSSSelector,
    elS?: CSSSelector,
    idRefS?: string,
    s?: Sigils,
    // /**
    //  * Attribute Sigil
    //  */
    // as?: AttrSigils,
    // /**
    //  * Element Sigil
    //  */
    // es?: ElementSigils,
    /**
     * Inferred prop name
     */
    prop?: InferredPropName,
    path?: SubPropPath;
    evt?: EventName;
    ms?: MarkerString;
    self?: boolean;
    host?: boolean;
}

export type InferredPropName = string;

/**
 * can contain dot (.) for sub property access and pipes (|) for method invocations
 */
export type SubPropPath = string;

export type EventName = string;

export type CSSSelector = string;

/**
 * starts with a dash, typically all kebab case 
 * inferrered prop name will be camel cased based on this.
 */
export type MarkerString = string;