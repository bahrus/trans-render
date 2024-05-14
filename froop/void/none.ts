import {ListOfLogicalExpressions} from '../types';
export function none<MCProps = any>(expr: ListOfLogicalExpressions,  src: MCProps): boolean{
    for(const subExpr of expr){
        if((<any>src)[subExpr as any as string]) return false;
    }
    return true;
}