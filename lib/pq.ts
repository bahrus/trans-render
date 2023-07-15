import {LogicOp, ListOfLogicalExpressions} from './types';
import {all} from './all.js';
import {none} from './none.js';
import {eq} from './eq.js';
import {oneOf} from './oneOf.js';
export function pq<MCProps = any>(expr: LogicOp<any>, src: MCProps){
    const {ifAllOf, ifNoneOf, ifEquals, ifAtLeastOneOf} = expr;
    if(ifAllOf !== undefined){
        //const {all} = await import('./all.js');
        if(!all(ifAllOf as ListOfLogicalExpressions, src)) return false;
    }
    if(ifNoneOf !== undefined){
        //const {none} = await import('./none.js');
        if(!none(ifNoneOf as ListOfLogicalExpressions, src)) return false;
    }
    if(ifEquals !== undefined){
        //const {eq} = await import('./eq.js');
        if(!eq(ifEquals as ListOfLogicalExpressions, src)) return false;
    }
    if(ifAtLeastOneOf !== undefined){
        //const {oneOf} = await import('./oneOf.js');
        if(!oneOf(ifAtLeastOneOf as ListOfLogicalExpressions, src)) return false;
    }
    return true;
}