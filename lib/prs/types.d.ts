export type ElTypes = '$' | '#' | '@' | '/' | '-' | '|' | '%' | '~';


export interface ElO {
    prop?: string,
    subProp?: string,
    elType?: ElTypes,
    perimeter?: string,
    event?: string,
    //TODO
    floor?: string,
}

export interface RegExpExt<TStatementGroup = any>{
    regExp: RegExp,
    defaultVals: Partial<TStatementGroup>,
}

export type RegExpOrRegExpExt<TStatementGroup = any> = RegExp | RegExpExt<TStatementGroup>;
