import {Matches, MatchRHS, RHS, Transformer, TransformJoinEvent} from '../types';
export class Join{
    constructor(public transformer: Transformer, fragment: DocumentFragment){
        const childElements = Array.from(fragment.children);
        for(const el of childElements){
            el.addEventListener('transform-join', async e => {
                const {detail} = (e as CustomEvent);// as TransformJoinEvent;
                if(detail !== undefined){
                    const {match} = detail as TransformJoinEvent;
                    if(match !== undefined){
                        const newMatch = join(transformer.ctx.match!, match);
                        transformer.ctx.match! = newMatch;
                    }
                }
                const {target} = e;
                await transformer.transform([target as Element]);
                transformer.flushCache();
            });
        }
    }
}

function join(lhs: Matches, rhs: Matches): Matches{
    const lhsGrouped = group(lhs);
    const rhsGrouped = group(rhs);
    const returnObj: Matches = {};
    for(const key in lhsGrouped){
        let val = lhsGrouped[key];
        const addend = rhsGrouped[key];
        if(addend !== undefined){
            val = val.concat(addend);
        }
        let count  = 0;;
        let dupKey = '^';
        for(const m of val){
            if(count === 0){
                returnObj[key] = m;
            }else{
                returnObj[dupKey] = m;
            }
            count++;
            dupKey = '^' + count;
        }
    }
    return returnObj;
}

function group(match: Matches): {[key: string]: RHS[]}{
    const returnObj: {[key: string]: RHS[]} = {};
    let lastKey = '';
    for(const key in match){
        let realKey = key;
        if(key[0] === '^'){
            realKey = lastKey;
        }else{
            lastKey = key;
        }
        if(returnObj[realKey] === undefined){
            returnObj[realKey] = [];
        }
        const rhs = match[realKey];
        returnObj[key].push(rhs)
    }
    return returnObj;
}