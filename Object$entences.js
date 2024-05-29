import { Object$tring } from './Object$tring.js';
export class Object$entences extends Object$tring {
    s;
    mapConfig;
    constructor(s, mapConfig) {
        super(s);
        this.s = s;
        this.mapConfig = mapConfig;
    }
    async parse() {
        await super.parse();
        const { mapConfig } = this;
        let { strVal, objVal } = this;
        if (objVal === undefined) {
            objVal = {};
            this.objVal = objVal;
        }
        if (strVal) {
            const statements = strVal.split('.')
                .map(s => s.trim())
                .filter(s => !s.startsWith('//'))
                .map(s => s.replace(reNormalize, ' '))
                .filter(s => s !== '');
            const { regExpExts } = mapConfig;
            for (const statement of statements) {
                const iPosOfSpace = statement.indexOf(' ');
                if (iPosOfSpace == -1)
                    throw 400;
                if (regExpExts !== undefined) {
                    let foundMatch = false;
                    const { tryParse } = await import('./lib/prs/tryParse.js');
                    for (const key in regExpExts) {
                        const rhs = regExpExts[key];
                        for (const regExpExt of rhs) {
                            if (!(regExpExt.regExp instanceof RegExp)) {
                                regExpExt.regExp = new RegExp(regExpExt.regExp);
                            }
                        }
                        const test = await tryParse(statement, rhs);
                        if (test !== null) {
                            if (objVal[key] === undefined)
                                objVal[key] = [];
                            objVal[key].push(test);
                            foundMatch = true;
                            break;
                        }
                    }
                    if (foundMatch)
                        continue;
                }
                if (objVal.rawStatements === undefined)
                    objVal.rawStatements = [];
                objVal.rawStatements.push(statement);
            }
        }
    }
}
const reNormalize = /\s+/g;
