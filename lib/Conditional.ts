import {RenderContext, IConditional} from './types';
import {DTR} from './DTR';
export class Conditional{
    constructor(public dtr: DTR){}
    async do({host, rhs, ctx}: RenderContext): Promise<void> {
        const exp = rhs[1] as IConditional;
        const {getVal} = await import('./getVal.js');
        if(exp.if !== undefined ){
            exp.ifVal = !!(await getVal(ctx!, exp.if));
        }
        if(exp.ifVal === false){
            await this.doFalse(ctx!);
            return;
        }
        if(exp.lhs !== undefined){
            exp.lhsVal = await getVal(ctx!, exp.lhs);
        }
        if(exp.rhs !== undefined){
            exp.rhsVal = await getVal(ctx!, exp.rhs);
        }
        let condition = true;
        if(exp.lhsVal !== undefined || exp.rhsVal !== undefined){
            switch(exp.op){
                case '===':
                case undefined:
                    if(exp.lhsVal !== exp.rhsVal){
                        condition = false;
                    }
            }
        }
        //TODO don't do either if expression matches previous value
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