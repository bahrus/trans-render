import {LogicOp, ListOfLogicalExpressions} from './types';
export async function pq<MCProps = any>(expr: LogicOp<any>, src: MCProps): Promise<boolean>{
    const {ifAllOf, ifNoneOf, ifEquals, ifAtLeastOneOf} = expr;
    if(ifAllOf !== undefined){
        const {all} = await import('./all.js');
        if(!await all(ifAllOf as ListOfLogicalExpressions, src)) return false;
    }
    if(ifNoneOf !== undefined){
        const {none} = await import('./none.js');
        if(!await none(ifNoneOf as ListOfLogicalExpressions, src)) return false;
    }
    if(ifEquals !== undefined){
        const {eq} = await import('./eq.js');
        if(!await eq(ifEquals as ListOfLogicalExpressions, src)) return false;
    }
    if(ifAtLeastOneOf !== undefined){
        const {oneOf} = await import('./oneOf.js');
        if(!await oneOf(ifAtLeastOneOf as ListOfLogicalExpressions, src)) return false;
    }
    return true;
}