export class Conditional {
    dtr;
    constructor(dtr) {
        this.dtr = dtr;
    }
    async do({ host, rhs, ctx }) {
        const conditionalExp = rhs[1];
        const { getVal } = await import('./getVal.js');
        const condition = await getVal(host, conditionalExp.if);
        if (condition) {
            const doTrueExpression = rhs[2];
            const verb = 'do_' + typeof (doTrueExpression);
            ctx.rhs = doTrueExpression;
            await this.dtr[verb](ctx);
        }
        else {
            const doFalseExpression = rhs[3];
            const verb = 'do_' + typeof (doFalseExpression);
            ctx.rhs = doFalseExpression;
            await this.dtr[verb](ctx);
        }
    }
}
