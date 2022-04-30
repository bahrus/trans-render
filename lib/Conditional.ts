import {RenderContext, IConditional} from './types';
import {DTR} from './DTR';
export class Conditional{
    constructor(public dtr: DTR){}
    async do({host, rhs, ctx}: RenderContext): Promise<void> {
        const conditionalExp = rhs[1] as IConditional;
        const {getVal} = await import('./getVal.js');
        let condition = true;//assume innocent until proven guilty
        if(conditionalExp.if !== undefined){
            if(!condition){
                condition = await getVal(host, conditionalExp.if);
            }
        }
        if(condition){
            await this.doTrue(ctx!);
        }else{
            await this.doFalse(ctx!);
        }
    }
    async doTrue({host, rhs, ctx}: RenderContext){
        const doTrueExpression = rhs[2];
        if(doTrueExpression !== undefined){
            const verb = 'do_' + typeof(doTrueExpression);
            ctx!.rhs = doTrueExpression;
            await (<any>this.dtr)[verb](ctx!);
        }
    }
    async doFalse({rhs, ctx}: RenderContext){
        const doFalseExpression = rhs[3];
        if(doFalseExpression !== undefined){
            const verb = 'do_' + typeof(doFalseExpression);
            ctx!.rhs = doFalseExpression;
            await (<any>this.dtr)[verb](ctx!);
        }
    }
}