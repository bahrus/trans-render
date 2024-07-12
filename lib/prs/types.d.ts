import { Scope } from "../types";

export type ElTypes = '$' | '#' | '@' | '/' | '-' | '|' | '%' | '~';


export interface ElO {
    /**
     * User of the name "prop" is a bit loose.  It is really a kind of identifier that 
     * **may** map to a prop, but it will typically not will map to an actual prop of the 
     * observed element, but rather to some property of a view model of the hosting element
     * or of a peer, non-visual  "web component as a service" sitting somewhere inside the Shadow 
     * DOM scope.
     */
    prop?: string,
    subProp?: string,
    elType?: ElTypes,
    perimeter?: string,
    event?: string,
    //TODO
    floor?: string,
    marker?: string,
    scope?: Scope,
}

export interface RegExpExt<TStatementGroup = any>{
    regExp: RegExp | string,
    defaultVals: Partial<TStatementGroup>,
    dssKeys?: [string, string][],
    dssArrayKeys?: [string, string][],
    statementPartParser?: StatementPartParser
}

export interface StatementPartParser {
    splitWord: string,
    propMap: {[key: string]: Array<RegExpExt>},
    parsedRegExps?: boolean,
}

export type RegExpOrRegExpExt<TStatementGroup = any> = RegExp | RegExpExt<TStatementGroup>;
