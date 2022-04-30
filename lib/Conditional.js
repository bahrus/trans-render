export class Conditional {
    dtr;
    constructor(dtr) {
        this.dtr = dtr;
    }
    async do({ host, rhs, ctx }) {
        const exp = rhs[1];
        const { getVal } = await import('./getVal.js');
        if (exp.if !== undefined) {
            exp.ifVal = !!(await getVal(host, exp.if));
        }
        if (exp.ifVal === false) {
            await this.doFalse(ctx);
            return;
        }
        if (exp.lhs !== undefined) {
            exp.lhsVal = await getVal(host, exp.lhs);
        }
        if (exp.rhs !== undefined) {
            exp.rhsVal = await getVal(host, exp.rhs);
        }
        let condition = true;
        if (exp.lhsVal !== undefined || exp.rhsVal !== undefined) {
            switch (exp.op) {
                case '===':
                case undefined:
                    if (exp.lhsVal !== exp.rhsVal) {
                        condition = false;
                    }
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
