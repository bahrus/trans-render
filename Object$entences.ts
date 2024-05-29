import {Object$tring} from './Object$tring.js';
import { AttrMapConfig, AttrMapPoint } from './be/types.js';
import {tryParse} from './lib/prs/tryParse.js';

export class Object$entences extends Object$tring{
    constructor(newVal: string, mapConfig: AttrMapConfig){
        super(newVal);
        let {strVal, objVal} = this;
        if(objVal === undefined) {
            objVal = {};
            this.objVal = objVal;
        }
        if(strVal){
            const statements = strVal.split('.')
                .map(s => s.trim())
                .filter( s=> !s.startsWith('//'))
                .map(s => s.replace(reNormalize, ' '))
                .filter( s => s !== '')
            ;
            const {regExpExts} = mapConfig;
            for(const statement of statements){
                const iPosOfSpace = statement.indexOf(' ');
                if(iPosOfSpace == -1) throw 400;
                if(regExpExts !== undefined){
                    let foundMatch = false;
                    for(const key in regExpExts){
                        const rhs = regExpExts[key]!;
                        for(const regExpExt of rhs){
                            if(!(regExpExt.regExp instanceof RegExp)){
                                regExpExt.regExp = new RegExp(regExpExt.regExp);
                            }
                        }
                        const test = tryParse(statement, rhs);
                        if(test !== null){
                            if(objVal[key] === undefined) objVal[key] = [];
                            objVal[key].push(test);
                            foundMatch = true;
                            break;
                        }

                    }
                    if(foundMatch) continue;
                }
                if(objVal.rawStatements === undefined) objVal.rawStatements = [];
                objVal.rawStatements.push(statement);
            }
        }
    }
}

const reNormalize = /\s+/g;