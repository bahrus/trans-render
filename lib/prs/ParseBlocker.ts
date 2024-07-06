import {IParseBlocker, ParsedBlockingRules, UnParsedBlockingRules} from '../../be/types';
export class ParseBlocker implements IParseBlocker{
    parsedBlockingRules: ParsedBlockingRules;
    constructor(unparsedBlockingRules: UnParsedBlockingRules){
        const parsedBlockingRules: ParsedBlockingRules = {};
        for(const key in unparsedBlockingRules){
            const rhs = unparsedBlockingRules[key];
            const regExps = rhs?.map(s => new RegExp(s));
            parsedBlockingRules[key] = regExps; 
        }
        this.parsedBlockingRules = parsedBlockingRules;
    }
}