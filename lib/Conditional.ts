import {RenderContext, IConditional} from './types';
import {DTR} from './DTR';
export class Conditional{
    constructor(public dtr: DTR){}
    async do({host, rhs, ctx}: RenderContext): Promise<void> {
        const conditionalExp = rhs[1] as IConditional;
        const {getVal} = await import('./getVal.js');
        const condition = await getVal(host, conditionalExp.if);
        if(condition){
            const doTrueExpression = rhs[2];
            const verb = 'do_' + typeof(doTrueExpression);
            ctx!.rhs = doTrueExpression;
            await (<any>this.dtr)[verb](ctx!);
        }else{
            const doFalseExpression = rhs[3];
            const verb = 'do_' + typeof(doFalseExpression);
            ctx!.rhs = doFalseExpression;
            await (<any>this.dtr)[verb](ctx!);
        }
    }
}