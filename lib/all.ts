import {ListOfLogicalExpressions, LogicEvalContext} from './types';
export function all<MCProps = any>(expr: ListOfLogicalExpressions,  src: MCProps, ctx: LogicEvalContext): boolean{
    for(const subExpr of expr){
        if(!(<any>src)[subExpr as any as string]) return false;
    }
    return true;
}
