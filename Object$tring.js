export class Object$tring {
    stringVal;
    objVal;
    arrVal;
    constructor(s) {
        const trim = s.trim();
        const firstOpenBracePos = trim.indexOf('{');
        const firstOpenBracketPos = trim.indexOf('[');
        if (firstOpenBracePos === -1 && firstOpenBracketPos === -1) {
            this.stringVal = trim;
            return;
        }
        const lastCloseBracePos = trim.lastIndexOf('}');
        const lastCloseBracketPos = trim.lastIndexOf(']');
        if (lastCloseBracePos === -1 && lastCloseBracketPos === -1) {
            this.stringVal = trim;
            return;
        }
        if ((firstOpenBracketPos === -1 || firstOpenBracePos < firstOpenBracketPos) &&
            (lastCloseBracketPos === -1 || lastCloseBracePos > lastCloseBracketPos)) {
            this.stringVal = trim.substring(lastCloseBracePos + 1).trim();
            const jsonString = trim.substring(firstOpenBracePos, lastCloseBracePos + 1);
            this.objVal = JSON.parse(jsonString);
            return;
        }
        if ((firstOpenBracePos === -1 || firstOpenBracketPos < firstOpenBracePos) &&
            (lastCloseBracePos === -1 || lastCloseBracketPos > lastCloseBracePos)) {
            this.stringVal = trim.substring(lastCloseBracketPos + 1).trim();
            this.arrVal = JSON.parse(trim.substring(firstOpenBracketPos, lastCloseBracketPos + 1));
            return;
        }
        this.stringVal = trim;
    }
}
