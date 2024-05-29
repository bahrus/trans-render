export class Object$tring {
    s;
    strVal;
    objVal;
    arrVal;
    constructor(s) {
        this.s = s;
    }
    async parse() {
        const s = this.s;
        const trim = s.trim();
        const firstOpenBracePos = trim.indexOf('{');
        const firstOpenBracketPos = trim.indexOf('[');
        if (firstOpenBracePos === -1 && firstOpenBracketPos === -1) {
            this.strVal = trim;
            return;
        }
        const lastCloseBracePos = trim.lastIndexOf('}');
        const lastCloseBracketPos = trim.lastIndexOf(']');
        if (lastCloseBracePos === -1 && lastCloseBracketPos === -1) {
            this.strVal = trim;
            return;
        }
        if ((firstOpenBracketPos === -1 || firstOpenBracePos < firstOpenBracketPos) &&
            (lastCloseBracketPos === -1 || lastCloseBracePos > lastCloseBracketPos)) {
            this.strVal = trim.substring(lastCloseBracePos + 1).trim();
            const jsonString = trim.substring(firstOpenBracePos, lastCloseBracePos + 1);
            this.objVal = JSON.parse(jsonString);
            return;
        }
        if ((firstOpenBracePos === -1 || firstOpenBracketPos < firstOpenBracePos) &&
            (lastCloseBracePos === -1 || lastCloseBracketPos > lastCloseBracePos)) {
            this.strVal = trim.substring(lastCloseBracketPos + 1).trim();
            this.arrVal = JSON.parse(trim.substring(firstOpenBracketPos, lastCloseBracketPos + 1));
            return;
        }
        this.strVal = trim;
    }
}
