export class Conditional {
    dtr;
    constructor(dtr) {
        this.dtr = dtr;
    }
    async do({ host, rhs, ctx }) {
        const conditionalExp = rhs[1];
        const { getVal } = await import('./getVal.js');
        let condition = true; //assume innocent until proven guilty
        if (conditionalExp.if !== undefined) {
            if (!condition) {
                condition = await getVal(host, conditionalExp.if);
            }
        }
        if (condition) {
            await this.doTrue(ctx);
        }
        else {
            await this.doFalse(ctx);
        }
    }
    async doTrue({ host, rhs, ctx }) {
        const doTrueExpression = rhs[2];
        if (doTrueExpression !== undefined) {
            const verb = 'do_' + typeof (doTrueExpression);
            ctx.rhs = doTrueExpression;
            await this.dtr[verb](ctx);
        }
    }
    async doFalse({ rhs, ctx }) {
        const doFalseExpression = rhs[3];
        if (doFalseExpression !== undefined) {
            const verb = 'do_' + typeof (doFalseExpression);
            ctx.rhs = doFalseExpression;
            await this.dtr[verb](ctx);
        }
    }
}
