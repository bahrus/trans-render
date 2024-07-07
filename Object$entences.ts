import {Object$tring} from './Object$tring.js';
import { AttrMapConfig, AttrMapPoint, IParseBlocker, ParsedBlockingRules, UnParsedBlockingRules } from './be/types.js';


export class Object$entences extends Object$tring{
    constructor(public s: string, public mapConfig: AttrMapConfig){
        super(s);
    }
    override async parse(){
        await super.parse();
        const {mapConfig} = this;
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
            const {regExpExts, blockingRules} = mapConfig;
            let parseBlocker = blockingRules as IParseBlocker | undefined;
            if(blockingRules !== undefined && blockingRules.parsedBlockingRules === undefined ){
                const {ParseBlocker} = await import('./lib/prs/ParseBlocker.js');
                parseBlocker = new ParseBlocker(blockingRules as UnParsedBlockingRules);
            }
            if(regExpExts !== undefined && !mapConfig.parsedRegExps){
                for(const key in regExpExts){
                    const rhs = regExpExts[key]!
                    for(const regExpExt of rhs){
                        if(!(regExpExt.regExp instanceof RegExp)){
                            regExpExt.regExp = new RegExp(regExpExt.regExp);
                        }
                    }
                }
                mapConfig.parsedRegExps = true;
            }
            for(const statement of statements){
                if(regExpExts !== undefined){
                    let foundMatch = false;
                    const {tryParse} = await import('./lib/prs/tryParse.js');
                    for(const key in regExpExts){
                        const rhs = regExpExts[key]!;

                        const test = await tryParse(statement, rhs, parseBlocker);
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

export const reNormalize = /\s+/g;