import {ListOfLogicalExpressions} from '../types';
export function oneOf<MCProps = any>(expr: ListOfLogicalExpressions,  src: MCProps): boolean{
    for(const subExpr of expr){
        if((<any>src)[subExpr as any as string]) return true;
    }
    return false;
}