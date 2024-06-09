import {IObject$tring} from './types';
export class Object$tring implements IObject$tring{
    strVal: string | undefined;
    objVal: any;
    arrVal: any[] | undefined;
    constructor(public s: string){}
    async parse(){
        const s = this.s;
        const trim = s.trim();
        const firstChar = trim[0];
        const firstOpenBracePos = firstChar === '{' ? 0 : -1;
        const firstOpenBracketPos = firstChar === '[' ? 0 : -1;
        if(firstOpenBracePos === -1 && firstOpenBracketPos === -1){
            this.strVal = trim;
            return;
        }
        const lastCloseBracePos = trim.lastIndexOf('}');
        const lastCloseBracketPos = trim.lastIndexOf(']');
        if(lastCloseBracePos === -1 && lastCloseBracketPos === -1){
            this.strVal = trim;
            return;
        }
        if(
            (firstOpenBracketPos === -1 || firstOpenBracePos < firstOpenBracketPos) && 
            (lastCloseBracketPos === -1 || lastCloseBracePos > lastCloseBracketPos)){
            this.strVal = trim.substring(lastCloseBracePos + 1).trim();
            const jsonString = trim.substring(firstOpenBracePos, lastCloseBracePos + 1);
            this.objVal = JSON.parse(jsonString);
            return;
        }
        if((firstOpenBracePos === -1 || firstOpenBracketPos < firstOpenBracePos) && 
            (lastCloseBracePos === -1 ||  lastCloseBracketPos > lastCloseBracePos)){
            this.strVal = trim.substring(lastCloseBracketPos + 1).trim();
            this.arrVal = JSON.parse(trim.substring(firstOpenBracketPos, lastCloseBracketPos + 1));
            return; 
        }
        this.strVal = trim;
    }
}