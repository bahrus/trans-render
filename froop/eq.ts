import {ListOfLogicalExpressions} from '../froop/types';
export function eq<MCProps = any>(expr: ListOfLogicalExpressions,  src: MCProps): boolean{
    let firstVal = undefined;
    let first = true;
    for(const subExpr of expr){
        if(first){
            firstVal = (<any>src)[subExpr as any as string];
            first = false;
            continue;
        }
        if((<any>src)[subExpr as any as string] !== firstVal) return false;
    }
    return true;
}