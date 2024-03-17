export type ElTypes = '$' | '#' | '@' | '/' | '-' | '|' | '%' | '~';


export interface ElO {
    prop?: string,
    elType?: ElTypes,
    perimeter?: string,
    event?: string,
}

export interface RegExpExt<TStatementGroup = any>{
    regExp: RegExp,
    defaultVals: TStatementGroup,
}

export type RegExpOrRegExpExt<TStatementGroup = any> = RegExp | RegExpExt<TStatementGroup>;
