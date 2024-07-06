export class ParseBlocker {
    parsedBlockingRules;
    constructor(unparsedBlockingRules) {
        const parsedBlockingRules = {};
        for (const key in unparsedBlockingRules) {
            const rhs = unparsedBlockingRules[key];
            const regExps = rhs?.map(s => new RegExp(s));
            parsedBlockingRules[key] = regExps;
        }
        this.parsedBlockingRules = parsedBlockingRules;
    }
}
