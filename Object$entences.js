import { Object$tring } from './Object$tring.js';
export class Object$entences extends Object$tring {
    constructor(newVal) {
        super(newVal);
        let { strVal, objVal } = this;
        if (objVal === undefined) {
            objVal = {};
            this.objVal = objVal;
        }
        if (strVal) {
            const statements = strVal.split('.')
                .map(s => s.trim())
                .filter(s => !s.startsWith('//'))
                .map(s => s.replace(reNormalize, ' '));
            for (const statement of statements) {
                const iPosOfSpace = statement.indexOf(' ');
                if (iPosOfSpace == -1)
                    throw 400;
                const head = statement.substring(0, iPosOfSpace);
                if (objVal[head] === undefined)
                    objVal[head] = [];
                objVal[head].push(statement.substring(iPosOfSpace + 1));
            }
        }
    }
}
const reNormalize = /\s+/g;
